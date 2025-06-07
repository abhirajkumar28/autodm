document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logout-btn');
  const facebookBtn = document.getElementById('connect-facebook');
  const instagramBtn = document.getElementById('connect-instagram');
  const whatsappBtn = document.getElementById('connect-whatsapp');
  const connectedAccountsList = document.getElementById('connected-accounts-list');
  
  // Check auth state
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = 'index.html';
    } else {
      loadIntegrations(user.uid);
    }
  });
  
  // Logout
  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  });
  
  // Load integrations
  function loadIntegrations(userId) {
    db.collection('users').doc(userId).collection('integrations').get()
      .then((querySnapshot) => {
        connectedAccountsList.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
          const integration = doc.data();
          updateIntegrationUI(integration.platform, integration.connected, integration.name);
          addConnectedAccount(integration);
        });
      });
  }
  
  // Update integration UI
  function updateIntegrationUI(platform, connected, name = '') {
    const statusEl = document.getElementById(`${platform}-status`);
    const btnEl = document.getElementById(`connect-${platform}`);
    
    if (connected) {
      statusEl.textContent = name ? `Connected: ${name}` : 'Connected';
      statusEl.className = 'connection-status connected';
      btnEl.textContent = 'Disconnect';
      btnEl.className = 'btn-danger';
    } else {
      statusEl.textContent = 'Not connected';
      statusEl.className = 'connection-status';
      btnEl.textContent = 'Connect';
      btnEl.className = 'btn-primary';
    }
  }
  
  // Add connected account to sidebar
  function addConnectedAccount(integration) {
    const accountItem = document.createElement('li');
    accountItem.innerHTML = `
      <a href="#">
        <span>${getPlatformIcon(integration.platform)}</span>
        ${integration.name || integration.platform}
      </a>
    `;
    connectedAccountsList.appendChild(accountItem);
  }
  
  // Get platform icon
  function getPlatformIcon(platform) {
    switch (platform) {
      case 'facebook': return '👍';
      case 'instagram': return '📷';
      case 'whatsapp': return '💬';
      default: return '🔗';
    }
  }
  
  // Facebook integration
  facebookBtn.addEventListener('click', () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    const statusEl = document.getElementById('facebook-status');
    const isConnected = statusEl.classList.contains('connected');
    
    if (isConnected) {
      // Disconnect
      db.collection('users').doc(userId).collection('integrations').doc('facebook').delete()
        .then(() => {
          updateIntegrationUI('facebook', false);
          loadIntegrations(userId);
        });
    } else {
      // Mock Facebook OAuth flow
      const pageName = prompt('Enter your Facebook Page name (mock integration):');
      if (pageName) {
        db.collection('users').doc(userId).collection('integrations').doc('facebook').set({
          platform: 'facebook',
          connected: true,
          name: pageName,
          connectedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          updateIntegrationUI('facebook', true, pageName);
          loadIntegrations(userId);
        });
      }
    }
  });
  
  // Instagram integration
  instagramBtn.addEventListener('click', () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    const statusEl = document.getElementById('instagram-status');
    const isConnected = statusEl.classList.contains('connected');
    
    if (isConnected) {
      // Disconnect
      db.collection('users').doc(userId).collection('integrations').doc('instagram').delete()
        .then(() => {
          updateIntegrationUI('instagram', false);
          loadIntegrations(userId);
        });
    } else {
      // Mock Instagram OAuth flow
      const username = prompt('Enter your Instagram username (mock integration):');
      if (username) {
        db.collection('users').doc(userId).collection('integrations').doc('instagram').set({
          platform: 'instagram',
          connected: true,
          name: username,
          connectedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          updateIntegrationUI('instagram', true, username);
          loadIntegrations(userId);
        });
      }
    }
  });
  
  // WhatsApp integration
  whatsappBtn.addEventListener('click', () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    const statusEl = document.getElementById('whatsapp-status');
    const isConnected = statusEl.classList.contains('connected');
    
    if (isConnected) {
      // Disconnect
      db.collection('users').doc(userId).collection('integrations').doc('whatsapp').delete()
        .then(() => {
          updateIntegrationUI('whatsapp', false);
          loadIntegrations(userId);
        });
    } else {
      // Mock WhatsApp OAuth flow
      const number = prompt('Enter your WhatsApp Business number (mock integration):');
      if (number) {
        db.collection('users').doc(userId).collection('integrations').doc('whatsapp').set({
          platform: 'whatsapp',
          connected: true,
          name: number,
          connectedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          updateIntegrationUI('whatsapp', true, number);
          loadIntegrations(userId);
        });
      }
    }
  });
});
