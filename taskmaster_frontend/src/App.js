import React, { useState, useEffect } from 'react';
import TaskList from './TaskList';
import LoginForm from './LoginForm';

function App() {
  const [authTokens, setAuthTokens] = useState(
    localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (authTokens) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [authTokens]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <TaskList />
      ) : (
        <div>
          <h1>Please log in</h1>
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
    </div>
  );
}

export default App;
