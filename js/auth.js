// Firebase Authentication Functions
document.addEventListener('DOMContentLoaded', function() {
  // Tab switching between login and register
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

  // Login function
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      
      // Check if email is verified
      if (userCredential.user.emailVerified) {
        window.location.href = 'dashboard.html';
      } else {
        showAuthStatus('Please verify your email first. Check your inbox.', 'error');
        await firebase.auth().signOut();
      }
    } catch (error) {
      showAuthStatus(getAuthErrorMessage(error.code), 'error');
    }
  });

  // Registration function
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
      showAuthStatus('Passwords do not match', 'error');
      return;
    }
    
    try {
      // Create user
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      
      // Send verification email
      await userCredential.user.sendEmailVerification();
      
      // Save user data to Firestore
      await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        emailVerified: false
      });
      
      showAuthStatus('Verification email sent! Please check your inbox.', 'success');
      
      // Switch to login tab after 3 seconds
      setTimeout(() => {
        document.getElementById('login-tab').click();
      }, 3000);
      
    } catch (error) {
      showAuthStatus(getAuthErrorMessage(error.code), 'error');
    }
  });

  // Forgot password functionality
  document.getElementById('forgot-password')?.addEventListener('click', async () => {
    const email = prompt('Enter your email to reset password:');
    if (email) {
      try {
        await firebase.auth().sendPasswordResetEmail(email);
        showAuthStatus('Password reset email sent. Check your inbox.', 'success');
      } catch (error) {
        showAuthStatus(getAuthErrorMessage(error.code), 'error');
      }
    }
  });

  // Check for email verification message
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('message') === 'verify-email') {
    showAuthStatus('Please verify your email to continue', 'error');
  }

  // Check auth state
  firebase.auth().onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('index.html')) {
      if (user.emailVerified) {
        window.location.href = 'dashboard.html';
      } else {
        firebase.auth().signOut();
      }
    }
  });
});

// Helper function to show authentication status messages
function showAuthStatus(message, type) {
  const statusEl = document.getElementById('auth-status');
  statusEl.textContent = message;
  statusEl.className = `auth-status ${type}`;
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'auth-status';
  }, 5000);
}

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'Account disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already in use',
    'auth/operation-not-allowed': 'Email/password accounts not enabled',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/too-many-requests': 'Too many attempts. Try again later',
    'auth/network-request-failed': 'Network error. Check your connection'
  };
  
  return errorMessages[errorCode] || 'Authentication failed. Please try again.';
}
