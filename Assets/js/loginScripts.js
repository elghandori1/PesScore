
// login validation form
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
   .then(response => response.json())
   .then(data => {
       document.getElementById('emailError').innerHTML = '';
       document.getElementById('passwordError').innerHTML = '';

       if (data.errors) {
           data.errors.forEach(error => {
               const p = document.createElement('p');
               p.textContent = error.msg;
               p.classList.add('error-message');
               
               if (error.path === 'email') {
                   document.getElementById('emailError').appendChild(p);
               } else if (error.path === 'password') {
                   document.getElementById('passwordError').appendChild(p);
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

// register validation form
