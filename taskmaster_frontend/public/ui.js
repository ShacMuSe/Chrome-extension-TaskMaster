function updateLoginUI(isLoggedIn) {
  // Show/hide login/logout buttons
  document.getElementById('login').style.display = isLoggedIn ? 'none' : 'inline-block';
  document.getElementById('signup').style.display = isLoggedIn ? 'none' : 'inline-block';
  document.getElementById('logout').style.display = isLoggedIn ? 'inline-block' : 'none';
  
  // Show/hide username section
  document.getElementById('user-info').style.display = isLoggedIn ? 'inline-block' : 'none';
  
  // If the user is logged in, display their username and level/experience
  if (isLoggedIn) {
    chrome.storage.local.get(['username', 'level', 'experience_points'], (result) => {
      const username = result.username;
      const level = result.level || 1;  // Default to level 1
      const experiencePoints = result.experience_points || 0;  // Default to 0

      if (username) {
        document.getElementById('username-display').textContent = username;
        document.getElementById('experience_points-display').textContent = `${experiencePoints} (Level: ${level})`;
      }
    });
  } else {
    // Clear username and experience points when logged out
    document.getElementById('username-display').textContent = '';
    document.getElementById('experience_points-display').textContent = '';
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
