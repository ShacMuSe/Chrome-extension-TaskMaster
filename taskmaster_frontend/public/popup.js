// Event listeners
document.getElementById('login').addEventListener('click', () => {
  const username = prompt("Enter username:");
  const password = prompt("Enter password:");
  login(username, password);
});
document.getElementById('logout').addEventListener('click', () => {
  logout(); // Call logout function when clicked
});

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





