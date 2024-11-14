import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadToken } from './auth';

const UpdateTask = ({ taskId, currentTitle, currentDescription, onUpdate }) => {
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const token = loadToken();

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedTask = { title, description };
    
    try {
      await axios.put(`http://localhost:8000/api/tasks/${taskId}/`, updatedTask, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      onUpdate(); // Call the onUpdate function to refresh the task list
      alert('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <form onSubmit={handleUpdate}>
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
      <button type="submit">Update Task</button>
    </form>
  );
};

export default UpdateTask;
