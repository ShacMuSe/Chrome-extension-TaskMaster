import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadToken } from './auth';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);  // Loading state
  const [newTask, setNewTask] = useState({ title: '', description: '', difficulty: '', estimated_duration: '' }); // State for new task
  const token = loadToken();

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/tasks/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setTasks(response.data);  // Set the tasks data
        setLoading(false);         // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setLoading(false);  // Set loading to false in case of error
      }
    };

    fetchTasks();
  }, [token]);

  // Delete task function
  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/tasks/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setTasks(tasks.filter(task => task.id !== id)); // Remove deleted task from list
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Handle adding a new task
  const addTask = async (e) => {
    e.preventDefault();  // Prevent form submission

    try {
      const response = await axios.post('http://localhost:8000/api/tasks/', newTask, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setTasks([...tasks, response.data]);  // Add the new task to the list
      setNewTask({ title: '', description: '', difficulty: '', estimated_duration: '' }); // Clear the form
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <div>
      <h2>Your Tasks</h2>

      {/* Add New Task Form */}
      <form onSubmit={addTask}>
        <h3>Add New Task</h3>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Difficulty (e.g., Easy, Medium, Hard)"
          value={newTask.difficulty}
          onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Estimated Duration (in hours)"
          value={newTask.estimated_duration}
          onChange={(e) => setNewTask({ ...newTask, estimated_duration: e.target.value })}
          required
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Display Tasks */}
      {loading ? (
        <p>Loading tasks...</p>  // Show loading state while fetching tasks
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Status: {task.is_completed ? 'Completed' : 'Pending'}</p>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
              {/* Add other buttons for editing or completing tasks */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
