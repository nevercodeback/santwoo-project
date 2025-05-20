// File: santwoo_project/frontend/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const errorMessageContainer = document.getElementById('errorMessage');

    // Check if already logged in, redirect to home
    if (isLoggedIn()) {
        window.location.href = 'index.html';
        return; // Stop further execution
    }
    
    // Check for session expired message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('sessionExpired')) {
        displayError('Your session has expired. Please log in again.');
    }
    if (urlParams.has('signupSuccess')) {
        displayMessage('Signup successful! Please log in.', 'success'); // Using displayError for styling, but could be a different function
    }


    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError(); // Clear previous errors

            const emailOrSantwooName = document.getElementById('emailOrSantwooName').value.trim();
            const password = document.getElementById('password').value;

            if (!emailOrSantwooName || !password) {
                displayError('Please fill in all fields.');
                return;
            }

            setLoadingState(true);

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ emailOrSantwooName, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    // data.message should contain the error from the backend
                    throw new Error(data.message || `HTTP error! Status: ${response.status}`);
                }

                // Login successful
                if (data.token && data.userId && data.santwooName) {
                    storeAuthData(data.token, { 
                        userId: data.userId, 
                        santwooName: data.santwooName,
                        firstName: data.firstName // Store firstName if available
                    });
                    window.location.href = 'index.html'; // Redirect to homepage
                } else {
                    throw new Error('Login failed: Invalid response from server.');
                }

            } catch (error) {
                console.error('Login error:', error);
                displayError(error.message || 'An unknown error occurred. Please try again.');
            } finally {
                setLoadingState(false);
            }
        });
    }

    function displayError(message) {
        if (errorMessageContainer) {
            errorMessageContainer.textContent = message;
            errorMessageContainer.classList.remove('hidden');
            errorMessageContainer.classList.remove('bg-green-100', 'text-green-700', 'border-green-300'); // Remove success styles
            errorMessageContainer.classList.add('bg-red-100', 'text-red-700', 'border-red-300'); // Add error styles
        }
    }
    
    function displayMessage(message, type = 'error') { // type can be 'success' or 'error'
        if (errorMessageContainer) {
            errorMessageContainer.textContent = message;
            errorMessageContainer.classList.remove('hidden');
            if (type === 'success') {
                errorMessageContainer.classList.remove('bg-red-100', 'text-red-700', 'border-red-300');
                errorMessageContainer.classList.add('bg-green-100', 'text-green-700', 'border-green-300');
            } else {
                errorMessageContainer.classList.remove('bg-green-100', 'text-green-700', 'border-green-300');
                errorMessageContainer.classList.add('bg-red-100', 'text-red-700', 'border-red-300');
            }
        }
    }

    function hideError() {
        if (errorMessageContainer) {
            errorMessageContainer.classList.add('hidden');
            errorMessageContainer.textContent = '';
        }
    }

    function setLoadingState(isLoading) {
        if (loginButton) {
            loginButton.disabled = isLoading;
            loginButton.textContent = isLoading ? 'Logging In...' : 'Login';
        }
    }
});
