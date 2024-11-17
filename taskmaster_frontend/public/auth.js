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

