function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
  
    errorMessage.textContent = ''; // Clear previous error messages
  
    if (username === 'admin' && password === '123') {
      window.location.href = 'adminpage.html';
    } else if (username && password) {
      window.location.href = 'userpage.html';
    } else {
      errorMessage.textContent = 'Please enter valid credentials.';
    }
  }
  