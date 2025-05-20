// File: santwoo_project/frontend/js/script.js

// DOM Element References
const siteTitleElement = document.getElementById('siteTitleDynamic');
const fabElement = document.getElementById('openCreatePostDialogFab');
const submitPostButton = document.getElementById('submitPostButton');
const categoryBar = document.getElementById('categoryBar');
const postCategorySelect = document.getElementById('postCategory');
const postFeed = document.getElementById('postFeed');
const createPostForm = document.getElementById('createPostForm');
const feedStatusMessage = document.getElementById('feedStatusMessage'); // For loading/no posts messages
const loginAuthButton = document.getElementById('loginAuthButton'); // The user icon button
const authButtonText = document.getElementById('authButtonText'); // sr-only text for the icon button

// Gradient Class Definitions
const defaultMainGradientBgClass = 'gradient-accent-main-default';
const defaultMainGradientTextClass = 'gradient-text-main-default';

// API Base URL is now expected to be defined in auth.js, which is loaded before this script.
// Ensure API_BASE_URL is correctly defined in auth.js (e.g., const API_BASE_URL = 'http://localhost:3000/api';)
if (typeof API_BASE_URL === 'undefined') {
    console.error("CRITICAL ERROR: API_BASE_URL is not defined. Ensure it's declared in auth.js and auth.js is loaded before script.js.");
    // Optionally, display an error to the user on the page
    if(feedStatusMessage) {
        feedStatusMessage.textContent = "Critical configuration error: API_BASE_URL is missing.";
        feedStatusMessage.classList.add('text-red-500');
        feedStatusMessage.classList.remove('hidden');
    }
} else {
    console.log('API_BASE_URL (from auth.js) is set to:', API_BASE_URL);
}


// Category Definitions
const categories = [
    { name: 'All', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="category-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>', id: 'all', gradientBgClass: 'gradient-bg-cat-all', gradientTextClass: 'gradient-text-cat-all' },
    { name: 'Tech', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="category-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-7.5h12.5" /></svg>', id: 'tech', gradientBgClass: 'gradient-bg-cat-tech', gradientTextClass: 'gradient-text-cat-tech' },
    { name: 'Life', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="category-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>', id: 'life', gradientBgClass: 'gradient-bg-cat-life', gradientTextClass: 'gradient-text-cat-life' },
    { name: 'Spiritual', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="category-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591L12 12.75V3m0 4.5A2.25 2.25 0 0014.25 9.75A2.25 2.25 0 0012 12.007 2.25 2.25 0 009.75 9.75A2.25 2.25 0 0012 7.507z" /></svg>', id: 'spiritual', gradientBgClass: 'gradient-bg-cat-spiritual', gradientTextClass: 'gradient-text-cat-spiritual' },
    { name: 'Love', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="category-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>', id: 'love', gradientBgClass: 'gradient-bg-cat-love', gradientTextClass: 'gradient-text-cat-love' }
];

const allGradientBgClasses = [defaultMainGradientBgClass, ...categories.map(c => c.gradientBgClass)];
const allGradientTextClasses = [defaultMainGradientTextClass, ...categories.map(c => c.gradientTextClass)];

// --- Helper Functions ---
function getCategoryDisplayName(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
}

function sanitizeHTML(str) {
    if (!str) return "";
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// --- Post Rendering ---
function renderPost(post) {
    const postElement = document.createElement('article');
    postElement.className = 'bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeIn cursor-pointer';
    postElement.dataset.category = post.category_id;
    postElement.dataset.postId = post.id;

    postElement.addEventListener('click', (event) => {
        if (event.target.closest('button.support-button') || event.target.closest('button.share-button')) {
            return; // Don't navigate if support/share button was clicked
        }
        window.location.href = `post.html?id=${post.id}`;
    });

    const categoryNameForDisplay = getCategoryDisplayName(post.category_id);
    const categoryPostTagColors = {
        all: 'text-gray-500', tech: 'text-blue-500', life: 'text-green-500',
        spiritual: 'text-purple-500', love: 'text-pink-500'
    };
    const categoryColorClass = categoryPostTagColors[post.category_id] || 'text-gray-500';

    const date = new Date(post.created_at);
    const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

    const safeTitle = sanitizeHTML(post.title || "No Title");
    const safeUserName = sanitizeHTML(post.user_name || 'Anonymous');
    // Truncate story for snippet, remove newlines for single line display in card
    const storySnippet = sanitizeHTML(post.story || "").replace(/\n/g, ' ').substring(0, 150) + (post.story && post.story.length > 150 ? "..." : "");


    postElement.innerHTML = `
        <div class="flex items-start sm:items-center mb-3">
            <div>
                <span class="font-semibold text-md sm:text-lg text-gray-800">${safeUserName}</span>
                <span class="block text-xs ${categoryColorClass} font-medium mt-0.5">#${categoryNameForDisplay}</span>
            </div>
            <span class="text-xs text-gray-500 ml-auto whitespace-nowrap pl-2 text-right">${formattedDate}<br>${formattedTime}</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">${safeTitle}</h2>
        <p class="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base line-clamp-3">${storySnippet}</p>
        <div class="flex items-center justify-between text-xs sm:text-sm">
            <button class="support-button flex items-center text-gray-600 hover:text-[#EF4444] transition-colors group py-1" data-post-id-support="${post.id}">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 group-hover:fill-[#EF4444] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                Support <span class="support-count ml-1">(${post.support_count || 0})</span>
            </button>
            <button class="share-button flex items-center text-gray-600 hover:text-[#EC4899] transition-colors py-1" data-post-id-share="${post.id}" data-post-title-share="${safeTitle}">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg>
                Share
            </button>
        </div>`;
    return postElement;
}

async function fetchAndDisplayPosts() {
    if (!postFeed || !feedStatusMessage) return;

    feedStatusMessage.textContent = 'Loading stories...';
    feedStatusMessage.classList.remove('hidden', 'text-red-500'); // Reset styles
    postFeed.innerHTML = ''; // Clear previous posts

    if (typeof API_BASE_URL === 'undefined' || !API_BASE_URL) {
        // This condition is now checked earlier, but good to keep as a safeguard
        console.error("API_BASE_URL is not defined when trying to fetch posts!");
        feedStatusMessage.textContent = "Configuration error: Cannot connect to server.";
        feedStatusMessage.classList.add('text-red-500');
        feedStatusMessage.classList.remove('hidden');
        return;
    }

    try {
        console.log(`Fetching posts from: ${API_BASE_URL}/posts`); // Log the URL being fetched
        const response = await fetch(`${API_BASE_URL}/posts`);
        console.log('Fetch response status:', response.status); // Log response status

        if (!response.ok) {
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                console.error('Error data from server:', errorData); // Log error data
                errorMsg = errorData.message || errorData.error || errorMsg;
            } catch (e) { 
                console.error('Could not parse error JSON:', e);
                const textResponse = await response.text(); // Try to get text response
                console.error('Error response text:', textResponse);
                errorMsg = textResponse || errorMsg;
            }
            throw new Error(errorMsg);
        }
        const posts = await response.json();
        console.log('Fetched posts:', posts); // Log fetched posts

        if (Array.isArray(posts) && posts.length > 0) {
            feedStatusMessage.classList.add('hidden'); // Hide loading message
            posts.forEach(post => {
                const postElement = renderPost(post);
                postFeed.appendChild(postElement);
            });
        } else {
            feedStatusMessage.textContent = 'No stories shared yet. Be the first!';
            feedStatusMessage.classList.remove('hidden'); // Ensure it's visible
        }
        // addInteractiveButtonListeners(); // This is now handled by event delegation setup in initializeApp
        filterPostsByCategory(); // Apply current category filter
    } catch (error) {
        console.error("Could not fetch posts:", error);
        feedStatusMessage.textContent = `Could not load posts. ${error.message}`;
        feedStatusMessage.classList.add('text-red-500');
        feedStatusMessage.classList.remove('hidden'); // Ensure error is visible
    }
}

// --- Category Bar and Theme Logic ---
function setupCategoryBar() {
    if (!categoryBar) return;
    categoryBar.innerHTML = ''; // Clear existing items

    categories.forEach((cat, index) => {
        const catItem = document.createElement('div');
        catItem.className = 'category-item';
        if (index === 0) { // Default to 'All' category active
            catItem.classList.add('active', cat.gradientBgClass);
        }
        catItem.dataset.categoryId = cat.id;
        catItem.dataset.gradientBgClass = cat.gradientBgClass;
        catItem.dataset.gradientTextClass = cat.gradientTextClass;
        catItem.innerHTML = `${cat.icon}<span class="category-name">${cat.name}</span>`;

        catItem.addEventListener('click', function() {
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active');
                allGradientBgClasses.forEach(gradClass => item.classList.remove(gradClass));
            });
            this.classList.add('active', this.dataset.gradientBgClass);

            applyThemeGradients(this.dataset.gradientBgClass, this.dataset.gradientTextClass);
            filterPostsByCategory();
        });
        categoryBar.appendChild(catItem);

        // Populate category select in dialog
        if (cat.id !== 'all' && postCategorySelect) {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            postCategorySelect.appendChild(option);
        }
    });

    if (postCategorySelect && postCategorySelect.options.length > 0 && categories.length > 1) {
        postCategorySelect.value = categories[1].id; // Default to the first actual category
    }
    // Apply initial theme based on default active category
    const initialActiveCat = categoryBar.querySelector('.category-item.active');
    if (initialActiveCat) {
        applyThemeGradients(initialActiveCat.dataset.gradientBgClass, initialActiveCat.dataset.gradientTextClass);
    }
}

function applyThemeGradients(bgGradient, textGradient) {
    allGradientBgClasses.forEach(cls => {
        if (fabElement) fabElement.classList.remove(cls);
        if (submitPostButton) submitPostButton.classList.remove(cls);
    });
    allGradientTextClasses.forEach(cls => {
        if (siteTitleElement) siteTitleElement.classList.remove(cls);
    });

    if (siteTitleElement) siteTitleElement.classList.add(textGradient);
    if (fabElement) fabElement.classList.add(bgGradient);
    if (submitPostButton) submitPostButton.classList.add(bgGradient);
}

function filterPostsByCategory() {
    if (!postFeed || !feedStatusMessage) return;
    const activeCategoryItem = categoryBar.querySelector('.category-item.active');
    if (!activeCategoryItem) return;

    const selectedCatId = activeCategoryItem.dataset.categoryId;
    let hasVisiblePosts = false;
    const allPosts = postFeed.querySelectorAll('article');

    allPosts.forEach(postArticle => {
        if (selectedCatId === 'all' || postArticle.dataset.category === selectedCatId) {
            postArticle.style.display = 'block';
            hasVisiblePosts = true;
        } else {
            postArticle.style.display = 'none';
        }
    });
    
    if (allPosts.length === 0 && typeof API_BASE_URL !== 'undefined') { // Check API_BASE_URL to avoid error on initial critical fail
        feedStatusMessage.textContent = 'No stories shared yet. Be the first!';
        feedStatusMessage.classList.remove('hidden', 'text-red-500');
    } else if (!hasVisiblePosts && allPosts.length > 0) { 
        feedStatusMessage.textContent = `No stories found in the "${getCategoryDisplayName(selectedCatId)}" category.`;
        feedStatusMessage.classList.remove('hidden', 'text-red-500');
    } else if (hasVisiblePosts) { 
        feedStatusMessage.classList.add('hidden');
    }
    // If API_BASE_URL was undefined, the message is already set by the initial check.
}


// --- Dialog Functionality ---
const createPostDialog = document.getElementById('createPostDialog');
const closeDialogButton = document.getElementById('closeCreatePostDialog');
const postTitleDialogInput = document.getElementById('postTitleDialog'); 

function openDialog() {
    if (typeof API_BASE_URL === 'undefined') {
        alert("Application is not properly configured. Cannot open dialog.");
        return;
    }
    if (typeof isLoggedIn !== 'function' || typeof getUserInfo !== 'function') {
        console.error("Authentication functions (isLoggedIn, getUserInfo) are not available. Ensure auth.js is loaded before script.js.");
        alert("Error: Authentication system not ready. Please try again later.");
        return;
    }

    if (!isLoggedIn()) {
        alert("Please log in to create a post."); 
        window.location.href = 'login.html'; 
        return;
    }

    if (createPostDialog) {
        const activeCategoryItem = categoryBar.querySelector('.category-item.active');
        const currentBgGradient = activeCategoryItem ? activeCategoryItem.dataset.gradientBgClass : defaultMainGradientBgClass;

        allGradientBgClasses.forEach(cls => {
            if (submitPostButton) submitPostButton.classList.remove(cls);
        });
        if (submitPostButton) submitPostButton.classList.add(currentBgGradient);
        
        const userInfo = getUserInfo();
        if (userInfo && userInfo.santwooName) {
            const userNameInput = document.getElementById('userName');
            if(userNameInput) userNameInput.value = userInfo.santwooName;
        }

        createPostDialog.showModal();
        document.body.classList.add('overflow-hidden'); 
    }
}
function closeDialog() {
    if (createPostDialog) {
        createPostDialog.close();
    }
}

if (fabElement) fabElement.addEventListener('click', openDialog);
if (closeDialogButton) closeDialogButton.addEventListener('click', closeDialog);

if (createPostDialog) {
    createPostDialog.addEventListener('click', (event) => { 
        if (event.target === createPostDialog) closeDialog();
    });
    createPostDialog.addEventListener('close', () => {
        if (createPostForm) createPostForm.reset();
        if (postCategorySelect && categories.length > 1) {
            postCategorySelect.value = categories[1].id; 
        }
        document.body.classList.remove('overflow-hidden');
    });
}

// --- Handle New Post Submission ---
if (createPostForm) {
    createPostForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        if (typeof API_BASE_URL === 'undefined') {
             alert("Application is not properly configured. Cannot submit post.");
             return;
        }
        if (typeof isLoggedIn !== 'function' || typeof fetchWithAuth !== 'function') {
            console.error("Authentication functions (isLoggedIn, fetchWithAuth) are not available.");
            alert("Error: Authentication system not ready for posting. Please try again later.");
            return;
        }

        if (!isLoggedIn()) {
            alert("Authentication error. Please log in again.");
            window.location.href = 'login.html';
            return;
        }

        const title = postTitleDialogInput.value.trim(); 
        const story = document.getElementById('userStory').value.trim();
        const categoryId = document.getElementById('postCategory').value;

        if (title === '' || story === '' || categoryId === '') {
            alert('Title, story, and category are required!');
            return;
        }

        const postData = {
            title: title,
            story: story,
            category_id: categoryId
        };

        const originalButtonText = submitPostButton.textContent;
        submitPostButton.textContent = 'Sharing...';
        submitPostButton.disabled = true;

        try {
            const response = await fetchWithAuth('/posts', 'POST', postData); 

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({message: "An unknown error occurred."}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const newPostFromServer = await response.json();

            if (postFeed && newPostFromServer && newPostFromServer.id) {
                feedStatusMessage.classList.add('hidden'); 
                const postElement = renderPost(newPostFromServer);
                postFeed.prepend(postElement); 
                filterPostsByCategory(); 
            } else {
                fetchAndDisplayPosts(); 
            }
            closeDialog();
        } catch (error) {
            console.error('Failed to create post:', error);
            alert(`Failed to create post: ${error.message}`);
            if (error.message.includes("Session expired") || error.message.includes("401")) { 
                 window.location.href = 'login.html?sessionExpired=true';
            }
        } finally {
            submitPostButton.textContent = originalButtonText;
            submitPostButton.disabled = false;
        }
    });
}

// --- Handle Support and Share Button Clicks (Event Delegation) ---
function setupInteractiveButtonListener() {
    if (!postFeed) return;

    postFeed.addEventListener('click', async function(event) { 
        if (typeof API_BASE_URL === 'undefined') {
             console.warn("Interaction attempt while application is not properly configured (API_BASE_URL missing).");
             return;
        }
        const target = event.target;
        const supportButton = target.closest('.support-button');
        const shareButton = target.closest('.share-button');

        if (supportButton) {
            event.stopPropagation(); 
            const postId = supportButton.dataset.postIdSupport;
            if (!postId || supportButton.classList.contains('supported-by-user') || supportButton.disabled) return;
            
            if (typeof isLoggedIn !== 'function' || typeof fetchWithAuth !== 'function') {
                console.error("Authentication functions for support not available.");
                alert("Error: Authentication system not ready. Please try again later.");
                return;
            }

            if (!isLoggedIn()) {
                alert("Please log in to support posts.");
                window.location.href = 'login.html';
                return;
            }
            supportButton.disabled = true;

            try {
                const response = await fetchWithAuth(`/posts/${postId}/support`, 'PUT'); 
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({message: "Failed to process support."}));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const countElement = supportButton.querySelector('.support-count');
                if (countElement) countElement.textContent = `(${data.new_support_count})`;
                supportButton.classList.add('supported-by-user', 'text-[#EF4444]');
                const heartIcon = supportButton.querySelector('svg');
                if (heartIcon) heartIcon.style.fill = '#EF4444'; 
                sessionStorage.setItem(`supported_${postId}`, 'true');

            } catch (error) {
                console.error('Failed to support post:', error);
                supportButton.disabled = false; 
                 if (error.message.includes("Session expired") || error.message.includes("401")) {
                     window.location.href = 'login.html?sessionExpired=true';
                }
            }
        }

        if (shareButton) {
            event.stopPropagation(); 
            const postId = shareButton.dataset.postIdShare;
            const postTitle = shareButton.dataset.postTitleShare || "Check out this story on SantWoo";
            const baseUrl = window.location.origin === 'null' || window.location.origin === 'file://' 
                            ? 'http://127.0.0.1:5500/frontend' 
                            : window.location.origin;
            const shareUrl = `${baseUrl}/post.html?id=${postId}`;

            if (navigator.share) {
                navigator.share({ title: postTitle, text: `Check out: ${postTitle}`, url: shareUrl })
                  .then(() => console.log('Successful share'))
                  .catch((error) => console.log('Error sharing:', error));
            } else {
                prompt("Copy this link to share:", shareUrl);
            }
        }
    });
}


// --- Authentication UI Update ---
function updateAuthUI() {
    if (!loginAuthButton || !authButtonText) return;
    if (typeof API_BASE_URL === 'undefined' && fabElement) { // If config failed, ensure FAB is hidden
        fabElement.classList.add('hidden');
        // Potentially disable login button too or show a generic error
        loginAuthButton.href = "#";
        loginAuthButton.setAttribute('aria-label', "System Error");
        if(authButtonText) authButtonText.textContent = "Error";
        return;
    }

    if (typeof isLoggedIn !== 'function' || typeof getUserInfo !== 'function' || typeof logout !== 'function') {
        console.warn("Auth functions not fully available for UI update. Ensure auth.js is loaded and initialized correctly.");
        loginAuthButton.href = "login.html";
        loginAuthButton.setAttribute('aria-label', "Login or Sign up");
        if(authButtonText) authButtonText.textContent = "Login or Sign up"; 
        loginAuthButton.onclick = null;
        if(fabElement) fabElement.classList.add('hidden');
        return;
    }
    
    if (isLoggedIn()) {
        const userInfo = getUserInfo();
        loginAuthButton.href = "#"; 
        loginAuthButton.setAttribute('aria-label', `Logged in as ${userInfo ? userInfo.santwooName : 'User'}. Click to logout.`);
        if(authButtonText) authButtonText.textContent = `Logout ${userInfo ? userInfo.santwooName : ''}`;
        
        loginAuthButton.onclick = (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                logout(); 
            }
        };
        if(fabElement) fabElement.classList.remove('hidden'); 

    } else {
        loginAuthButton.href = "login.html";
        loginAuthButton.setAttribute('aria-label', "Login or Sign up");
        if(authButtonText) authButtonText.textContent = "Login or Sign up";
        loginAuthButton.onclick = null; 
        if(fabElement) fabElement.classList.add('hidden'); 
    }
}


// --- Initial Page Load and Event Listeners ---
function initializeApp() {
    if (typeof API_BASE_URL === 'undefined') {
        // The critical error is already logged by the API_BASE_URL check at the top.
        // UpdateAuthUI will also reflect this error state.
        updateAuthUI(); // Ensure UI reflects the critical error state
        return; // Stop further initialization if config is broken
    }

    if (typeof isLoggedIn !== 'function') {
        console.error("auth.js might not be loaded or initialized correctly. isLoggedIn is not a function.");
        if(feedStatusMessage) {
            feedStatusMessage.textContent = "Error initializing application. Authentication module failed to load.";
            feedStatusMessage.classList.add('text-red-500');
            feedStatusMessage.classList.remove('hidden');
        }
        updateAuthUI(); // Reflect error in auth button as well
        return;
    }

    setupCategoryBar();
    fetchAndDisplayPosts(); 
    updateAuthUI(); 
    setupInteractiveButtonListener(); // Setup the main event listener for post interactions

    if (document.getElementById('currentYear')) {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    if (fabElement && !allGradientBgClasses.some(cls => fabElement.classList.contains(cls))) {
        fabElement.classList.add(defaultMainGradientBgClass);
    }
    if (submitPostButton && !allGradientBgClasses.some(cls => submitPostButton.classList.contains(cls))) {
        submitPostButton.classList.add(defaultMainGradientBgClass);
    }
    if (siteTitleElement && !allGradientTextClasses.some(cls => siteTitleElement.classList.contains(cls))) {
        siteTitleElement.classList.add(defaultMainGradientTextClass);
    }
}

window.addEventListener('authChange', (event) => {
    console.log('Auth state changed:', event.detail);
    updateAuthUI();
    if (typeof API_BASE_URL !== 'undefined') { // Only fetch if app is configured
        fetchAndDisplayPosts(); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeApp, 100); 
});

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
    .line-clamp-3 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
    }
`;
document.head.appendChild(styleSheet);
