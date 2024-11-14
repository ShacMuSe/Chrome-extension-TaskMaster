import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskManager = () => {
  // State for tasks, new task input, and the token
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [token, setToken] = useState(localStorage.getItem('authToken')); // Get token from localStorage (you can update as per your method)

  // Fetch tasks when token is available
  useEffect(() => {
    if (token) {
      axios
        .get('http://localhost:8000/api/tasks/', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setTasks(response.data))
        .catch((error) => console.error('Error fetching tasks:', error));
    }
  }, [token]);

  // Handle adding a new task
  const addTask = () => {
    if (newTask) {
      axios
        .post(
          'http://localhost:8000/api/tasks/',
          { name: newTask },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          setTasks([...tasks, response.data]); // Add the new task to the list
          setNewTask(''); // Clear input field
        })
        .catch((error) => console.error('Error adding task:', error));
    }
  };

  // Handle deleting a task
  const deleteTask = (taskId) => {
    axios
      .delete(`http://localhost:8000/api/tasks/${taskId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== taskId)); // Remove deleted task from the list
      })
      .catch((error) => console.error('Error deleting task:', error));
  };

  return (
    <div>
      <h1>Task Manager</h1>
      
      {/* Input for new task */}
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)} // Update newTask state
        placeholder="Enter new task"
      />
      <button onClick={addTask}>Add Task</button>
      
      {/* Task list */}
      <ul>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task.id}>
              {task.name} 
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </li>
          ))
        ) : (
          <p>No tasks available</p>
        )}
      </ul>
    </div>
  );
};

export default TaskManager;
