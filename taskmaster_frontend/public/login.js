document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Call login function to send credentials to Django
    login(username, password);
  });
  
  function login(username, password) {
    const credentials = { username, password };
  
    // Send credentials to Django API to get JWT token
    fetch('http://localhost:8000/api/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
      .then(response => response.json())
      .then(data => {
        if (data.access) {
          // Save token in Chrome local storage
          chrome.storage.local.set({ 'access_token': data.access }, function() {
            console.log('Token saved');
            window.location.href = 'popup.html';  // Redirect after successful login
          });
        } else {
          console.error('Failed to obtain token');
        }
      })
      .catch(error => {
        console.error('Error during login:', error);
      });
  }
  