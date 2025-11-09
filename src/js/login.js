// Utility function to show notifications
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add slideOutRight animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const buttonText = loginButton.querySelector('.button-text');
const errorMessage = document.getElementById('errorMessage');

// Add loading state
function setLoading(isLoading) {
  if (isLoading) {
    loginButton.disabled = true;
    buttonText.innerHTML = '<span class="loading"></span>Logging in...';
  } else {
    loginButton.disabled = false;
    buttonText.textContent = 'Login';
  }
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('voter-id').value.trim();
  const password = document.getElementById('password').value.trim();

  // Clear previous errors
  errorMessage.style.display = 'none';

  if (!voter_id || !password) {
    showError("Please enter both voter ID and password!");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ voter_id, password })
    });

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      setLoading(false);
      let errorMessage = "Login failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // If we can't parse JSON, it might be a server error
        if (response.status === 0 || response.status >= 500) {
          errorMessage = "Server is not responding. Please make sure the backend server is running on port 8000.";
        }
      }
      showError(errorMessage);
      showNotification(errorMessage, 'error');
      return;
    }

    const data = await response.json();

    // Store JWT token and role in localStorage
    const token = data.access_token;
    const role = data.role;

    console.log("Login successful:", role, token);

    localStorage.setItem("jwtToken", token);
    localStorage.setItem("role", role);

    // Show success notification
    showNotification("Login successful! Redirecting...", 'success');

    // Small delay before redirect for better UX
    setTimeout(() => {
      if (role === "admin") {
        window.location.href = `http://127.0.0.1:8080/admin.html?token=${token}`;
      } else if (role === "user") {
        window.location.href = `http://127.0.0.1:8080/index.html?token=${token}`;
      }
    }, 500);

  } catch (error) {
    setLoading(false);
    console.error("Login error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Unable to connect to server.";
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      errorMessage = "Cannot connect to backend server. Please make sure the FastAPI server is running on http://127.0.0.1:8000";
    } else {
      errorMessage = `Connection error: ${error.message}`;
    }
    
    showError(errorMessage);
    showNotification("Backend server is not running. Please start the FastAPI server.", 'error');
  }
});

// Add input validation feedback
document.getElementById('voter-id').addEventListener('input', function() {
  if (this.value.trim()) {
    this.style.borderColor = 'rgba(99, 102, 241, 0.5)';
  }
});

document.getElementById('password').addEventListener('input', function() {
  if (this.value.trim()) {
    this.style.borderColor = 'rgba(99, 102, 241, 0.5)';
  }
});
