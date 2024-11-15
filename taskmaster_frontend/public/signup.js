// Event listener for sign-up submission
document.getElementById('submit-signup').addEventListener('click', () => {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
  
    if (username && email && password) {
      // Call the signup function with the input data
      signup(username, email, password);
    } else {
      alert('All fields are required!');
    }
  });
  
  // Sign up function (sending data to Django API)
  function signup(username, email, password) {
    fetch('http://127.0.0.1:8000/api/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message === 'User created successfully') {
        alert('Sign-up successful! You can now log in.');
        // Optionally, you can trigger login after successful sign-up or just show the login screen
        document.getElementById('signUpForm').style.display = 'none';
        document.getElementById('signup').style.display = 'block'; // Show the Sign Up button again
      } else {
        alert('Sign-up failed: ' + data.message);
      }
    })
    .catch(error => {
      alert('Error during sign-up: ' + error.message);
    });
  }
  