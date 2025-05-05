document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        account_name: document.getElementById('account_name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        // Clear previous error messages
        document.getElementById('nameError').innerHTML = '';
        document.getElementById('account_nameError').innerHTML = '';
        document.getElementById('emailError').innerHTML = '';
        document.getElementById('passwordError').innerHTML = '';
        document.getElementById('confirmPasswordError').innerHTML = '';

        if (data.errors) {
            data.errors.forEach(error => {
                const p = document.createElement('p');
                p.textContent = error.msg;
                p.classList.add('error-message');
                
                if (error.path === 'name') {
                    document.getElementById('nameError').appendChild(p);
                } else if (error.path === 'account_name') {
                    document.getElementById('account_nameError').appendChild(p);
                } else if (error.path === 'email') {
                    document.getElementById('emailError').appendChild(p);
                } else if (error.path === 'password') {
                    document.getElementById('passwordError').appendChild(p);
                } else if (error.path === 'confirmPassword') {
                    document.getElementById('confirmPasswordError').appendChild(p);
                }
            });
        } else {
            window.location.href = '/';
        }
    })
    .catch(err => {
        console.error('Error:', err);
    });
});