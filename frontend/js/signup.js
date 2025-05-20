// File: santwoo_project/frontend/js/signup.js

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const signupButton = document.getElementById('signupButton');
    const errorMessageContainer = document.getElementById('errorMessage');
    const santwooNameInput = document.getElementById('santwooName');
    const santwooNameFeedback = document.getElementById('santwooNameFeedback');

    let santwooNameCheckTimeout;

    // Check if already logged in, redirect to home
    if (isLoggedIn()) {
        window.location.href = 'index.html';
        return; // Stop further execution
    }

    if (santwooNameInput && santwooNameFeedback) {
        santwooNameInput.addEventListener('input', () => {
            clearTimeout(santwooNameCheckTimeout);
            const name = santwooNameInput.value.trim();
            santwooNameFeedback.textContent = ''; // Clear previous feedback
            santwooNameFeedback.className = 'santwooname-feedback'; // Reset classes

            if (name.length < 3) {
                if (name.length > 0) {
                    santwooNameFeedback.textContent = 'Minimum 3 characters.';
                    santwooNameFeedback.classList.add('santwooname-taken'); // Use 'taken' style for general error
                }
                return;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(name)) {
                santwooNameFeedback.textContent = 'Only letters, numbers, and underscores.';
                santwooNameFeedback.classList.add('santwooname-taken');
                return;
            }


            santwooNameFeedback.textContent = 'Checking availability...';
            santwooNameFeedback.classList.add('santwooname-checking');

            santwooNameCheckTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/check-santwooname?name=${encodeURIComponent(name)}`);
                    const data = await response.json();
                    
                    santwooNameFeedback.className = 'santwooname-feedback'; // Reset classes
                    if (response.ok) {
                        if (data.available) {
                            santwooNameFeedback.textContent = 'SantWoo name is available!';
                            santwooNameFeedback.classList.add('santwooname-available');
                        } else {
                            santwooNameFeedback.textContent = data.message || 'SantWoo name is taken.';
                            santwooNameFeedback.classList.add('santwooname-taken');
                        }
                    } else {
                        santwooNameFeedback.textContent = data.message || 'Could not check name.';
                        santwooNameFeedback.classList.add('santwooname-taken');
                    }
                } catch (error) {
                    console.error('Error checking SantWoo name:', error);
                    santwooNameFeedback.className = 'santwooname-feedback'; // Reset classes
                    santwooNameFeedback.textContent = 'Error checking name.';
                    santwooNameFeedback.classList.add('santwooname-taken');
                }
            }, 700); // Debounce for 700ms
        });
    }


    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError(); // Clear previous errors

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const dateOfBirth = document.getElementById('dateOfBirth').value;
            const email = document.getElementById('email').value.trim();
            const santwooName = santwooNameInput.value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Basic client-side validation
            if (!firstName || !lastName || !dateOfBirth || !email || !santwooName || !password || !confirmPassword) {
                displayError('Please fill in all fields.');
                return;
            }
            if (password.length < 6) {
                displayError('Password must be at least 6 characters long.');
                return;
            }
            if (password !== confirmPassword) {
                displayError('Passwords do not match.');
                return;
            }
             if (santwooName.length < 3 || !/^[a-zA-Z0-9_]+$/.test(santwooName)) {
                displayError('SantWoo name must be at least 3 characters and contain only letters, numbers, or underscores.');
                return;
            }


            setLoadingState(true);

            try {
                // Final check for SantWoo name availability before submitting
                const checkResponse = await fetch(`${API_BASE_URL}/auth/check-santwooname?name=${encodeURIComponent(santwooName)}`);
                const checkData = await checkResponse.json();
                if (!checkResponse.ok || !checkData.available) {
                    displayError(checkData.message || 'SantWoo name is taken or invalid. Please choose another.');
                    setLoadingState(false);
                    santwooNameFeedback.textContent = checkData.message || 'SantWoo name is taken.';
                    santwooNameFeedback.className = 'santwooname-feedback santwooname-taken';
                    return;
                }


                const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        dateOfBirth,
                        email,
                        santwooName,
                        password,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    // data.message should contain the error from the backend
                    // It might be an array of errors from express-validator
                    let errorMessage = 'Signup failed. Please try again.';
                    if (data.message) {
                        errorMessage = data.message;
                    } else if (data.errors && Array.isArray(data.errors)) {
                        errorMessage = data.errors.map(err => err.msg).join(' ');
                    }
                    throw new Error(errorMessage || `HTTP error! Status: ${response.status}`);
                }

                // Signup successful
                // Don't auto-login here, redirect to login page with a success message
                window.location.href = 'login.html?signupSuccess=true';

            } catch (error) {
                console.error('Signup error:', error);
                displayError(error.message || 'An unknown error occurred during signup.');
            } finally {
                setLoadingState(false);
            }
        });
    }

    function displayError(message) {
        if (errorMessageContainer) {
            errorMessageContainer.textContent = message;
            errorMessageContainer.classList.remove('hidden');
            errorMessageContainer.classList.remove('success-message');
            errorMessageContainer.classList.add('error-message');
        }
    }

    function hideError() {
        if (errorMessageContainer) {
            errorMessageContainer.classList.add('hidden');
            errorMessageContainer.textContent = '';
        }
    }

    function setLoadingState(isLoading) {
        if (signupButton) {
            signupButton.disabled = isLoading;
            signupButton.textContent = isLoading ? 'Creating Account...' : 'Create Account';
        }
    }
});
