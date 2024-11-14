import React, { useState } from 'react';
import { getToken, saveToken } from './auth'; // On utilise les fonctions auth.js pour obtenir et sauvegarder le token

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Essayez de récupérer le token en envoyant le username et le password
      const data = await getToken(username, password);
      saveToken(data.access); // Sauvegarder le token JWT dans le localStorage
      alert('Login successful!');
      window.location.href = '/tasks'; // Rediriger vers la page des tâches
    } catch (error) {
      alert('Authentication failed!');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
