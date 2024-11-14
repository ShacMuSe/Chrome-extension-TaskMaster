import React, { useState, useEffect } from "react";
import axios from "axios";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    difficulty: 1,
    estimated_duration: 0,
  });

  // Fetch tasks with token
  const fetchTasks = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please log in");
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios.get("http://localhost:8000/api/tasks/", config)
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          refreshAccessToken();
        } else {
          setError("Failed to fetch tasks.");
        }
      });
  };

  // Refresh the token if expired
  const refreshAccessToken = () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      setError("Please log in again.");
      return;
    }

    axios.post("http://localhost:8000/api/token/refresh/", { refresh: refreshToken })
      .then(response => {
        const newAccessToken = response.data.access;
        localStorage.setItem("access_token", newAccessToken);
        fetchTasks(); // Retry fetching tasks with the new token
      })
      .catch(error => {
        setError("Error refreshing token. Please log in again.");
      });
  };

  // Handle editing task
  const handleEditClick = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      difficulty: task.difficulty,
      estimated_duration: task.estimated_duration,
    });
  };

  // Handle save updated task
  const handleSaveEdit = () => {
    const token = localStorage.getItem("access_token");

    axios.put(
      `http://localhost:8000/api/tasks/${editingTask.id}/`,
      newTask,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then(response => {
      setEditingTask(null);
      fetchTasks();
    }).catch(error => {
      setError("Failed to update task.");
    });
  };

  // Handle delete task
  const handleDeleteClick = (taskId) => {
    const token = localStorage.getItem("access_token");

    axios.delete(
      `http://localhost:8000/api/tasks/${taskId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then(response => {
      fetchTasks();
    }).catch(error => {
      setError("Failed to delete task.");
    });
  };

  // Toggle task completion status
  const handleCompleteClick = (taskId) => {
    const token = localStorage.getItem("access_token");
  
    axios.post(
      `http://localhost:8000/api/tasks/${taskId}/toggle/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(response => {
      fetchTasks(); // Refresh tasks to reflect the status change
    })
    .catch(error => {
      setError("Failed to toggle task completion.");
    });
  };

  // Handle form field changes for new or edited task
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle adding a new task
  const handleAddTask = () => {
    const token = localStorage.getItem("access_token");

    axios.post(
      "http://localhost:8000/api/tasks/",
      newTask,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then(response => {
      fetchTasks();
      setNewTask({
        title: "",
        description: "",
        difficulty: 1,
        estimated_duration: 0,
      });
    }).catch(error => {
      setError("Failed to add task.");
    });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <h1>Task List</h1>
      {error && <p>{error}</p>}

      {/* Display task list */}
      {tasks.length === 0 && <p>No tasks available.</p>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong>
            <p>{task.description}</p>
            <p>Difficulty: {task.difficulty}</p>
            <p>Estimated Duration: {task.estimated_duration} minutes</p>
            <p>Status: {task.completed ? "Completed" : "Pending"}</p>

            {/* Toggle Completion Button */}
            <button onClick={() => handleCompleteClick(task.id, task.completed)}>
              {task.completed ? "Mark as Uncompleted" : "Mark as Completed"}
            </button>
            <button onClick={() => handleEditClick(task)}>
              Edit
            </button>
            <button onClick={() => handleDeleteClick(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Add new task form */}
      <div>
        <h2>Add Task</h2>
        <input
          type="text"
          name="title"
          value={newTask.title}
          onChange={handleChange}
          placeholder="Task title"
        />
        <textarea
          name="description"
          value={newTask.description}
          onChange={handleChange}
          placeholder="Task description"
        />
        <select
          name="difficulty"
          value={newTask.difficulty}
          onChange={handleChange}
        >
          <option value={1}>Easy</option>
          <option value={2}>Medium</option>
          <option value={3}>Hard</option>
          <option value={4}>Very Hard</option>
          <option value={5}>Extreme</option>
        </select>
        <input
          type="number"
          name="estimated_duration"
          value={newTask.estimated_duration}
          onChange={handleChange}
          placeholder="Estimated Duration"
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
    </div>
  );
};

export default TaskList;
