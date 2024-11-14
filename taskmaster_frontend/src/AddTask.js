import React, { useState } from 'react';
import axios from 'axios';
import { loadToken } from './auth';

const AddTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const token = loadToken();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTask = {
      title,
      description,
    };

    try {
      await axios.post('http://localhost:8000/api/tasks/', newTask, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      alert('Task added successfully');
      setTitle(''); // Reset form
      setDescription('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div>
      <h3>Add a New Task</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task Description"
        />
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
};

export default AddTask;
