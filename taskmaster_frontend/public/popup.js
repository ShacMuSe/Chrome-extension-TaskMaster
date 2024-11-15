// Function to log in and store token
function login(username, password) {
  fetch('http://localhost:8000/api/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.access) {
        chrome.storage.local.set({ 'access_token': data.access, 'refresh_token': data.refresh, 'username': username }, () => {
          console.log('Token saved successfully.');
          fetchTasks(); // Fetch tasks immediately after logging in
          updateLoginUI(true); // Update UI to show logout button
          hideMessage();
        });
      } else {
        console.error('Login failed:', data);
        alert('Login failed. Please check your credentials.');
      }
    })
    .catch(error => {
      console.error('Error logging in:', error);
      alert('Error logging in. Please try again.');
    });
}

// Function to log out
function logout() {
  chrome.storage.local.remove(['access_token', 'refresh_token'], () => {
    console.log('Logged out');
    clearTaskList();
    updateLoginUI(false); // Update UI to show login button
    fetchTasks();
  });
}


// Function to fetch tasks
function fetchTasks() {
  chrome.storage.local.get('access_token', (result) => {
    const token = result.access_token;
    if (!token) {
      console.error('No access token found. Please log in.');
      clearTaskList();
      updateLoginUI(false);
      return;
    }
    document.getElementById('taskList').innerHTML = 'Loading tasks...';
    fetch('http://localhost:8000/api/tasks/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            // Try to refresh the token if unauthorized
            refreshToken();
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched tasks:', data);
        if (Array.isArray(data)) {
          displayTasks(data);
        } else {
          console.error('Unexpected response format:', data);
        }
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
        document.getElementById('taskList').innerHTML = 'Error fetching tasks. Please try again later.';
      });
  });
}

function clearTaskList() {
  const taskListElement = document.getElementById('task-list');
  if (taskListElement) {
    taskListElement.innerHTML = ''; // Clear the list
  }
}

// Function to refresh the token
function refreshToken() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('refresh_token', (result) => {
      const refreshToken = result.refresh_token;
      if (!refreshToken) {
        console.error('No refresh token found. Please log in again.');
        return reject('No refresh token');
      }

      fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.access) {
            chrome.storage.local.set({ 'access_token': data.access }, () => {
              console.log('Token refreshed successfully.');
              resolve(data.access);
            });
          } else {
            console.error('Failed to refresh token:', data);
            reject('Failed to refresh token');
          }
        })
        .catch(error => {
          console.error('Error refreshing token:', error);
          reject('Error refreshing token');
        });
    });
  });
}

// Function to map numeric difficulty to text
function getDifficultyDetails(difficulty) {
  const difficultyMap = {
    1: { label: 'Easy', color: '#28a745' }, // Green
    2: { label: 'Medium', color: '#ffc107' }, // Yellow
    3: { label: 'Hard', color: '#ff6f00' }, // Orange
    4: { label: 'Very Hard', color: '#dc3545' }, // Red
    5: { label: 'Extreme', color: '#800080' } // Purple
  };
  return difficultyMap[difficulty] || { label: 'Unknown', color: '#6c757d' }; // Default if out of range
}

// Function to display tasks
function displayTasks(tasks) {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = ''; // Clear the task list

  const taskTemplate = document.getElementById('task-template'); // Get the template

  tasks.forEach(task => {
    // Clone the template
    const taskItem = taskTemplate.content.cloneNode(true);

    // Populate the task details
    taskItem.querySelector('.task-title').textContent = task.title;
    taskItem.querySelector('.difficulty').textContent = getDifficultyDetails(task.difficulty).label;
    taskItem.querySelector('.difficulty').style.color = getDifficultyDetails(task.difficulty).color;
    taskItem.querySelector('.task-description').textContent = task.description;
    taskItem.querySelector('.task-duration').textContent = `Estimated Duration: ${task.estimated_duration} mins`;
    taskItem.querySelector('.task-user').textContent = `Created by: ${task.user}`;
    
    const statusElement = taskItem.querySelector('.task-status');
    statusElement.textContent = task.completed ? 'Completed' : 'Not Completed';
    statusElement.className = `task-status ${task.completed ? 'completed' : 'not-completed'}`;
    

    // Add data attributes to buttons
    taskItem.querySelector('.complete-btn').dataset.id = task.id;
    taskItem.querySelector('.edit-btn').dataset.id = task.id;
    taskItem.querySelector('.delete-btn').dataset.id = task.id;

    // Add event listeners
    taskItem.querySelector('.complete-btn').addEventListener('click', () => toggleTaskCompletion(task.id));
    taskItem.querySelector('.edit-btn').addEventListener('click', () => editTask(task));
    taskItem.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

    // Append the populated task to the task list
    taskList.appendChild(taskItem);
  });
}

// Function to toggle task completion
function toggleTaskCompletion(taskId) {
  chrome.storage.local.get('access_token', (result) => {
    const token = result.access_token;
    if (!token) {
      console.error('No token found!');
      showMessage('Login, please');
      return;
    }
    fetch(`http://localhost:8000/api/tasks/${taskId}/toggle/`, {  
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          console.error(`Error: HTTP status ${response.status}`);
          return response.text();
        }
        return response.json();
      })
      .then(data => {
        if (typeof data === 'string') {    
          console.error('Received HTML response:', data);
        } else {
          console.log('Task updated:', data);
          fetchTasks(); // Refresh the tasks after completion
          hideMessage();
        }
      })
      .catch(error => {
        console.error('Error toggling task completion:', error);
      });
  });
}


// Function to edit task
function editTask(task) {
  // Hide the add task form and show the edit task form
  document.getElementById('add-task-form').style.display = 'none';
  document.getElementById('edit-task-form').style.display = 'block';

  // Populate the edit form with the current task's data
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-desc').value = task.description;
  document.getElementById('edit-task-difficulty').value = task.difficulty;
  document.getElementById('edit-task-duration').value = task.estimated_duration;

  // Update task when the edit form is submitted
  document.getElementById('edit-task-form').onsubmit = (event) => {
    event.preventDefault();
    updateTask(task.id);
  };

  // Cancel edit and show the add task form again
  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    document.getElementById('add-task-form').style.display = 'block';
    document.getElementById('edit-task-form').style.display = 'none';
  });
}

// Function to update task
function updateTask(taskId) {
  const updatedTask = {
    title: document.getElementById('edit-task-title').value,
    description: document.getElementById('edit-task-desc').value,
    difficulty: parseInt(document.getElementById('edit-task-difficulty').value, 10),
    estimated_duration: parseInt(document.getElementById('edit-task-duration').value, 10),
  };

  chrome.storage.local.get('access_token', (result) => {
    const token = result.access_token;
    if (!token) {
      console.error('No token found!');
      showMessage('Login, please');
      return;
    }
    fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedTask),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Task updated:', data);
        fetchTasks(); // Refresh the tasks after updating
        // Hide the edit form and show the add task form again
        document.getElementById('edit-task-form').style.display = 'none';
        document.getElementById('add-task-form').style.display = 'block';
      })
      .catch(error => {
        console.error('Error updating task:', error);
      });
  });
}

// Function to delete task
function deleteTask(taskId) {
  chrome.storage.local.get('access_token', (result) => {
    const token = result.access_token;
    if (!token) {
      console.error('No token found!');
      showMessage('Login, please');
      return;
    }

    fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if there's no content in the response
        if (response.status === 204) {
          console.log('Task deleted successfully. No content returned.');
          fetchTasks(); // Refresh the tasks after deletion
        } else {
          return response.json(); // Parse the response if there is content
        }
      })
      .then(data => {
        if (data) {
          console.log('Response after delete:', data);
        }
      })
      .catch(error => {
        console.error('Error deleting task:', error);
      });
  });
}


// Function to add a task
function addTask() {
  const taskTitle = document.getElementById('task-title').value;
  const taskDescription = document.getElementById('task-desc').value;
  const taskDifficulty = parseInt(document.getElementById('task-difficulty').value, 10);
  const taskDuration = parseInt(document.getElementById('task-duration').value, 10);

  chrome.storage.local.get('access_token', (result) => {
    const token = result.access_token;

    if (!token) {
      console.error('No token found!');
      showMessage('Login, please');
      return;
    }

    const newTask = {
      title: taskTitle,
      description: taskDescription,
      difficulty: taskDifficulty,
      estimated_duration: taskDuration,
    };

    fetch('http://localhost:8000/api/tasks/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newTask),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Task added:', data);
        if (data.id) {
          fetchTasks(); // Refresh the tasks after adding
          // Clear the form fields after submission
          document.getElementById('task-title').value = '';
          document.getElementById('task-desc').value = '';
          document.getElementById('task-difficulty').value = '';
          document.getElementById('task-duration').value = '';
        }
      })
      .catch(error => {
        console.error('Error adding task:', error);
      });
  });
}



function showMessage(message) {
  const messageElement = document.getElementById('message');
  if (messageElement) {
    messageElement.textContent = message; // Set the message text
    messageElement.style.display = 'block'; // Make it visible
  }
}

function hideMessage() {
  const messageElement = document.getElementById('message');
  if (messageElement) {
    messageElement.style.display = 'none'; // Hide the message
    messageElement.textContent = ''; // Clear the message text
  }
}


// Event listeners
document.getElementById('login').addEventListener('click', () => {
  const username = prompt("Enter username:");
  const password = prompt("Enter password:");
  login(username, password);
});
document.getElementById('logout').addEventListener('click', logout);

// When the Sign Up button is clicked, show the sign-up form
document.getElementById('signup').addEventListener('click', () => {
  document.getElementById('signUpForm').style.display = 'block';
  document.getElementById('signup').style.display = 'none'; // Hide the Sign Up button
});

// Cancel Sign Up (Hide the sign-up form and show the Sign Up button again)
document.getElementById('cancel-signup').addEventListener('click', () => {
  document.getElementById('signUpForm').style.display = 'none';
  document.getElementById('signup').style.display = 'block'; // Show the Sign Up button again
});

document.getElementById('add-task-form').addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent the form from reloading the page
  addTask(); // Call the addTask function to send task data
});


// Fetch tasks when the popup opens
/*document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();
});*/
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('access_token', (result) => {
    if (result.access_token) {
      console.log('User is logged in');
      updateLoginUI(true);
      fetchTasks();
    } else {
      console.log('No token found, please login');
      updateLoginUI(false);
      clearTaskList();
    }
  });
});



function updateLoginUI(isLoggedIn) {
  // Show/hide login/logout buttons
  document.getElementById('login').style.display = isLoggedIn ? 'none' : 'inline-block';
  document.getElementById('logout').style.display = isLoggedIn ? 'inline-block' : 'none';
  
  // Show/hide username section
  document.getElementById('user-info').style.display = isLoggedIn ? 'inline-block' : 'none';
  
  // If the user is logged in, display their username
  if (isLoggedIn) {
    chrome.storage.local.get(['username'], (result) => {
      const username = result.username;
      if (username) {
        document.getElementById('username-display').textContent = `${username}`;
      }
    });
  } else {
    document.getElementById('username-display').textContent = ''; // Clear username when logged out
  }
}


