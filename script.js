document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    const registerPasswordField = document.getElementById('password');
    const loginPasswordField = document.getElementById('passwordLogin');

    let registerTimingData = [];
    let loginTimingData = [];

    registerPasswordField.addEventListener('keydown', (e) => {
        registerTimingData.push(Date.now());
    });

    loginPasswordField.addEventListener('keydown', (e) => {
        loginTimingData.push(Date.now());
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = registerPasswordField.value;
        const registerFeedback = document.getElementById('registerFeedback');

        const registerIntervals = calculateIntervals(registerTimingData);

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, intervals: registerIntervals })
            });
            
            const data = await response.json();
            registerFeedback.textContent = data.message;
        } catch (error) {
            registerFeedback.textContent = 'Error: ' + error.message;
        }

        registerPasswordField.value = ''; // Clear the password field
        registerTimingData = []; // Reset timing data after submission
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('usernameLogin').value;
        const password = loginPasswordField.value;
        const loginFeedback = document.getElementById('loginFeedback');

        const loginIntervals = calculateIntervals(loginTimingData);

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, intervals: loginIntervals })
            });

            const data = await response.json();
            loginFeedback.textContent = data.message;
        } catch (error) {
            loginFeedback.textContent = 'Error: ' + error.message;
        }

        loginPasswordField.value = ''; // Clear the password field
        loginTimingData = []; // Reset timing data after submission
    });

    function calculateIntervals(timingData) {
        let intervals = [];
        for (let i = 1; i < timingData.length; i++) {
            intervals.push(timingData[i] - timingData[i - 1]);
        }
        return intervals;
    }
});
