const taskList = document.getElementById('task-list');
const addTaskButton = document.getElementById('add-task-btn');

document.addEventListener('DOMContentLoaded', function () {
    // Get the token from local storage when the popup is opened
    chrome.storage.local.get(['access_token'], function (result) {
      if (result.access_token) {
        console.log('Token found:', result.access_token);
        
        // Event listener for 'Add Task' button click
        const addButton = document.getElementById('add-task-button');
        const taskInput = document.getElementById('task-input');
  
        // Fetch and display tasks on page load
        fetchTasks(result.access_token);
  
        // Add task event listener
        addButton.addEventListener('click', function () {
          const taskTitle = taskInput.value.trim();
          if (taskTitle) {
            addTask(result.access_token, taskTitle);
          } else {
            console.error('Task title cannot be empty');
          }
        });
  
        // Optional: If you want the user to be able to press Enter to add a task
        taskInput.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') {
            const taskTitle = taskInput.value.trim();
            if (taskTitle) {
              addTask(result.access_token, taskTitle);
            } else {
              console.error('Task title cannot be empty');
            }
          }
        });
      } else {
        console.error('No token found, please log in first');
        window.location.href = 'login.html'; // Redirect to login if no token found
      }
    });
  });
  
  // Function to add a new task
  function addTask(token, taskTitle) {
    const newTask = {
      title: taskTitle,
      description: "",  // You can add more fields as necessary
      difficulty: 1,
      estimated_duration: 30,
    };
  
    fetch('http://localhost:8000/api/tasks/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newTask)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Task added:', data);
        if (data.id) {
          // Reload tasks after adding the new task
          fetchTasks(token);
        } else {
          console.error('Failed to add task:', data);
        }
      })
      .catch(error => {
        console.error('Error adding task:', error);
      });
  }
  
  // Function to fetch tasks and display them
  function fetchTasks(token) {
    fetch('http://localhost:8000/api/tasks/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log('Fetched tasks:', data);  // Log to inspect
        if (data && data.task) {
          displayTasks([data.task]);  // If it’s a single task, wrap it in an array for display
        } else {
          console.error('Tasks data is not in the expected format:', data);
        }
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
  }
  
  
  
  // Function to display tasks in the popup
  function displayTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';  // Clear the existing tasks
  
    tasks.forEach(task => {
      const taskItem = document.createElement('li');
      taskItem.textContent = `Title: ${task.title}, Description: ${task.description}, Completed: ${task.completed}`;
      tasksList.appendChild(taskItem);
    });
  }
  