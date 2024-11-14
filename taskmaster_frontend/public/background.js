// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log("TaskMaster extension installed.");
  });
  
  // Function to toggle task completion status
  function toggleTaskCompletion(taskId, token) {
    fetch(`http://localhost:8000/api/tasks/${taskId}/toggle/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
    .then(response => response.json())
    .then(data => {
      if (data.status) {
        console.log("Task completion toggled");
        // Here, you could trigger an update on the popup or content page to reflect changes
      } else {
        console.error("Error toggling task completion");
      }
    })
    .catch(error => console.error('Error:', error));
  }
  
  // Listen for messages from content or popup scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TOGGLE_TASK") {
      const { taskId, token } = message;
      toggleTaskCompletion(taskId, token);
    }
  });
  