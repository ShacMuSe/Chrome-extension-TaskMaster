document.addEventListener('DOMContentLoaded', function () {
    // Ranking button functionality
    const rankingBtn = document.getElementById('ranking-btn');
    const rankingPage = document.getElementById('ranking-page');
    const closeRankingBtn = document.getElementById('close-ranking');
    
    // Show ranking page
    rankingBtn.addEventListener('click', function () {
      rankingPage.style.display = 'block';
      fetchRankings(); // Fetch rankings when opening the page
    });
  
    // Close ranking page
    closeRankingBtn.addEventListener('click', function () {
      rankingPage.style.display = 'none';
    });
});
  
function fetchRankings() {
        chrome.storage.local.get(['access_token'], (result) => {
          const token = result.access_token;
          if (!token) {
            console.error('User is not authenticated.');
            return;
          }
          fetch('http://localhost:8000/api/rankings/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json'
            }
          })
          .then(response => {
            if (response.status === 401 && refreshToken) {
              console.log('Token expired, attempting to refresh...');
              return refreshToken(refreshToken)
                .then(newAccessToken => {
                  if (newAccessToken) {
                    // Retry the task creation with the refreshed token
                    return fetch('http://localhost:8000/api/rankings/', {
                        method: 'GET',
                        headers: {
                          'Authorization': `Bearer ${newAccessToken}`, 
                          'Content-Type': 'application/json'
                        }
                      });
                  } else {
                    throw new Error('Unable to refresh token');
                  }
                });
            } else {
              return response;
            }
          })
            .then(response => response.json())
            .then(data => {
              if (Array.isArray(data)) {
                console.log('Rankings fetched succesfully');
                const rankingList = document.getElementById('ranking-list');
                rankingList.innerHTML = '';
                data.forEach(user => {
                  const li = document.createElement('li');
                  li.textContent = `${user.rank}. ${user.username} - Level ${user.level}, ${user.experience_points} XP`;
                  rankingList.appendChild(li);
                });
              } else {
                console.error('Invalid data format:', data);
              }
            })
            .catch(error => {
              console.error('Error fetching rankings:', error);
            });
        });
      }
       
    
  
  