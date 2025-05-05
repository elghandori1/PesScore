// Function to show notification (same as register)
function showNotification(message, isError = true) {
    const notification = document.getElementById('serverNotification');
    const messageElement = document.getElementById('notificationMessage');
    
    notification.style.display = 'flex';
    messageElement.textContent = message;
    
    // Set class based on error/success
    notification.className = isError ? 'notification error' : 'notification success';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Close button functionality
document.getElementById('closeNotification')?.addEventListener('click', () => {
    document.getElementById('serverNotification').style.display = 'none';
});

document.getElementById('loginForm').addEventListener('submit', function(e){
    e.preventDefault();

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        if (data.errors) {
            if (data.errors.length > 0) {
                showNotification(data.errors[0].msg);
            }
        } else {
            showNotification('Login successful!', false);
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        if (err.errors) {
            showNotification(err.errors[0]?.msg || 'Login failed');
        } else {
            showNotification('An unexpected error occurred. Please try again.');
        }
    });
});