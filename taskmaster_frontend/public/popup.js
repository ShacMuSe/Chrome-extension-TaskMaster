// Function to log in and store token
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
        chrome.storage.local.set({ 'access_token': data.access, 'refresh_token': data.refresh }, () => {
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

  tasks.forEach(task => {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');

    // Check the completed status and set the appropriate label or class
    const completedLabel = task.completed ? 'Completed' : 'Not Completed';
    const completedClass = task.completed ? 'completed' : 'not-completed';

    taskItem.innerHTML = `
  <p><strong>${task.title}</strong> - Difficulty: 
    <span class="difficulty" style="color: ${getDifficultyDetails(task.difficulty).color};">
      <strong>${getDifficultyDetails(task.difficulty).label}</strong>
    </span>
  </p>
  <p>${task.description}</p>
  <p>Estimated Duration: ${task.estimated_duration} mins</p>
  <p>Status: <span class="${completedClass}">${completedLabel}</span></p> <!-- Completed status -->

  <!-- Container for the buttons to be aligned in the same line -->
  <div class="task-buttons">
    <button class="complete-btn ${task.completed ? 'completed-btn' : ''}" data-id="${task.id}">
      <i class="fas fa-check-circle"></i>
    </button>
    <button class="edit-btn" data-id="${task.id}">
      <i class="fas fa-edit"></i>
    </button>
    <button class="delete-btn" data-id="${task.id}">
      <i class="fas fa-trash-alt"></i>
    </button>
  </div>
`;

    taskList.appendChild(taskItem);

    // Event listeners for task actions
    taskItem.querySelector('.complete-btn').addEventListener('click', () => toggleTaskCompletion(task.id));
    taskItem.querySelector('.edit-btn').addEventListener('click', () => editTask(task));
    taskItem.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
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
    fetch(`http://localhost:8000/api/tasks/${taskId}/toggle/`, {  // Update the URL to match Django pattern
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (!response.ok) {
          console.error(`Error: HTTP status ${response.status}`);
          return response.text(); // Get the raw response text (HTML in case of error)
        }
        return response.json(); // Otherwise, parse it as JSON
      })
      .then(data => {
        if (typeof data === 'string') {
          // If the response is a string (probably HTML), log it
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

// Function to update the login UI
function updateLoginUI(isLoggedIn) {
  const loginButton = document.getElementById('login');
  const logoutButton = document.getElementById('logout');

  if (isLoggedIn) {
    loginButton.style.display = 'none';
    logoutButton.style.display = 'inline-block';
  } else {
    loginButton.style.display = 'inline-block';
    logoutButton.style.display = 'none';
  }
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
      showLoggedInState();
      fetchTasks();
    } else {
      console.log('No token found, please login');
      showLoggedOutState();
      clearTaskList();
    }
  });
});
// Function to show logged-in state (display logout button)
function showLoggedInState() {
  document.getElementById('login').style.display = 'none'; // Hide login button
  document.getElementById('logout').style.display = 'block'; // Show logout button
}

// Function to show logged-out state (display login button)
function showLoggedOutState() {
  document.getElementById('login').style.display = 'block'; // Show login button
  document.getElementById('logout').style.display = 'none'; // Hide logout button
}
