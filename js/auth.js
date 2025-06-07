document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  });
  
  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  });
  
  // Login form
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        showAuthStatus(error.message, 'error');
      });
  });
  
  // Register form
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (password !== confirm) {
      showAuthStatus('Passwords do not match', 'error');
      return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        return db.collection('users').doc(userCredential.user.uid).set({
          name: name,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        showAuthStatus(error.message, 'error');
      });
  });
  
  // Check auth state
  auth.onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('index.html')) {
      window.location.href = 'dashboard.html';
    }
  });
  
  function showAuthStatus(message, type) {
    const statusEl = document.getElementById('auth-status');
    statusEl.textContent = message;
    statusEl.className = `auth-status ${type}`;
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'auth-status';
    }, 5000);
  }
});
