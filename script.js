ocument.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const isAuthenticated = await simulateAuthentication(username, password);

        if (isAuthenticated) {
            window.location.href = 'camera.html';
        } else {
            alert('Authentication failed. Please check your credentials.');
        }
    });

    async function simulateAuthentication(username, password) {
        return new Promise((resolve) => {
            setTimeout(() => {

                resolve(username === 'sangini' && password === 'password');
            }, 1000); 
        });
    }
});