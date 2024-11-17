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

  function clearTaskList() {
    const taskListElement = document.getElementById('task-list');
    if (taskListElement) {
      taskListElement.innerHTML = ''; // Clear the list
    }
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
