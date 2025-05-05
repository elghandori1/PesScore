
  function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    
    errorDiv.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
    
    errorContainer.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  // Check for URL error parameter and display it
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      showError(error);
    }
  });
