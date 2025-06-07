document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logout-btn');
  const flowsGrid = document.getElementById('flows-grid');
  const recentFlowsList = document.getElementById('recent-flows-list');
  
  // Check auth state
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = 'index.html';
    } else {
      loadUserData(user.uid);
    }
  });
  
  // Logout
  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  });
  
  // Load user data
  function loadUserData(userId) {
    // Load flows for grid
    db.collection('flows')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(6)
      .get()
      .then((querySnapshot) => {
        flowsGrid.innerHTML = '';
        recentFlowsList.innerHTML = '';
        
        if (querySnapshot.empty) {
          flowsGrid.innerHTML = '<p>No flows found. Create your first flow!</p>';
          return;
        }
        
        querySnapshot.forEach((doc) => {
          const flow = doc.data();
          // Add to grid
          const flowCard = document.createElement('div');
          flowCard.className = 'flow-card';
          flowCard.innerHTML = `
            <h3>${flow.name}</h3>
            <p>${flow.description || 'No description'}</p>
            <div class="flow-stats">
              <span>${flow.steps?.length || 0} steps</span>
              <span>${flow.updatedAt?.toDate().toLocaleDateString() || 'No date'}</span>
            </div>
            <div class="flow-actions">
              <a href="flow-builder.html?flowId=${doc.id}" class="btn-secondary">Edit</a>
            </div>
          `;
          flowsGrid.appendChild(flowCard);
          
          // Add to recent list
          const flowItem = document.createElement('li');
          flowItem.innerHTML = `
            <a href="flow-builder.html?flowId=${doc.id}">
              <span>📋</span> ${flow.name}
            </a>
          `;
          recentFlowsList.appendChild(flowItem);
        });
      });
    
    // Load stats
    db.collection('users').doc(userId).get().then((doc) => {
      if (doc.exists) {
        document.getElementById('active-bots').textContent = doc.data().activeBots || 0;
        document.getElementById('connected-accounts').textContent = doc.data().connectedAccounts || 0;
        document.getElementById('total-messages').textContent = doc.data().totalMessages || 0;
      }
    });
  }
});
