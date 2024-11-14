import React from 'react';

const TaskList = ({ tasks }) => {
  return (
    <div>
      <h2>Task List</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <h3>{task.name}</h3>
            <p>Difficulty: {task.difficulty}</p>
            <p>Estimated Duration: {task.duration} hours</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
