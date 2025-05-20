// File: santwoo_project/frontend/js/auth.js

// IMPORTANT: Ensure this matches the API_BASE_URL in your other frontend JS files
// For local development, this should be your local backend URL.
// For live deployment, this MUST be your live backend URL.
const API_BASE_URL = 'http://localhost:3000/api'; // Or your actual local backend URL

const TOKEN_KEY = 'santwoo_auth_token';
const USER_INFO_KEY = 'santwoo_user_info';

/**
 * Stores the JWT token and user info in localStorage.
 * @param {string} token - The JWT token.
 * @param {object} userInfo - Basic user information (e.g., userId, santwooName, firstName).
 */
function storeAuthData(token, userInfo) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    // Dispatch a custom event to notify other parts of the app about login
    window.dispatchEvent(new CustomEvent('authChange', { detail: { loggedIn: true, user: userInfo } }));
}

/**
 * Retrieves the JWT token from localStorage.
 * @returns {string|null} The token or null if not found.
 */
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Retrieves user information from localStorage.
 * @returns {object|null} User information object or null.
 */
function getUserInfo() {
    const userInfoStr = localStorage.getItem(USER_INFO_KEY);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
}

/**
 * Checks if a user is currently logged in (i.e., has a token).
 * @returns {boolean} True if logged in, false otherwise.
 */
function isLoggedIn() {
    return !!getToken();
}

/**
 * Logs the user out by removing the token and user info from localStorage.
 */
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    // Dispatch a custom event to notify other parts of the app about logout
    window.dispatchEvent(new CustomEvent('authChange', { detail: { loggedIn: false, user: null } }));
    // Redirect to login page or homepage after logout
    // window.location.href = '/login.html'; // Or '/' or '/index.html'
}

/**
 * Makes an authenticated API request.
 * @param {string} url - The API endpoint (e.g., '/posts').
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE).
 * @param {object} [body] - The request body for POST/PUT requests.
 * @returns {Promise<Response>} The fetch API Response object.
 */
async function fetchWithAuth(endpoint, method = 'GET', body = null) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // If token is expired or invalid (401), log out the user
    if (response.status === 401 && isLoggedIn()) {
        console.warn('Token expired or invalid. Logging out.');
        logout();
        // Optionally redirect to login page or show a message
        window.location.href = 'login.html?sessionExpired=true';
        // Throw an error to stop further processing in the calling function
        throw new Error('Session expired. Please log in again.');
    }
    
    return response;
}

// Expose functions if using modules, or they'll be globally available
// For simple script includes, they are global.
// export { storeAuthData, getToken, getUserInfo, isLoggedIn, logout, fetchWithAuth, API_BASE_URL };
