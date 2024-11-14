import React, { useState } from 'react';
import axios from 'axios';

const AddTask = () => {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Make the API request to add the task
    axios.post('http://localhost:8000/api/tasks/', {
      name,
      difficulty,
      duration
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(response => {
        console.log('Task added successfully:', response);
      })
      .catch(error => {
        console.error('Error adding task:', error);
      });
  };

  return (
    <div>
      <h2>Add a New Task</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Difficulty:</label>
          <input
            type="text"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Estimated Duration (hours):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
};

export default AddTask;
