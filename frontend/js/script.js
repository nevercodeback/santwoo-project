// File: santwoo_project/frontend/js/script.js

const siteTitleElement = document.getElementById('siteTitleDynamic');
const fabElement = document.getElementById('openCreatePostDialogFab');
const submitPostButton = document.getElementById('submitPostButton');
const categoryBar = document.getElementById('categoryBar');
const postCategorySelect = document.getElementById('postCategory');
const postFeed = document.getElementById('postFeed');
const createPostForm = document.getElementById('createPostForm');

const defaultMainGradientBgClass = 'gradient-accent-main-default';
const defaultMainGradientTextClass = 'gradient-text-main-default';

// IMPORTANT: For local development, this should be your local backend URL.
// For live deployment, this MUST be your live backend URL (e.g., 'https://santwoo.com/api').
const API_BASE_URL = 'https://santwoo.com/api';

const categories = [
    { name: 'All', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="category-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>', id: 'all', gradientBgClass: 'gradient-bg-cat-all', gradientTextClass: 'gradient-text-cat-all' },
    { name: 'Tech', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="category-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-7.5h12.5" /></svg>', id: 'tech', gradientBgClass: 'gradient-bg-cat-tech', gradientTextClass: 'gradient-text-cat-tech' },
    { name: 'Life', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="category-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>', id: 'life', gradientBgClass: 'gradient-bg-cat-life', gradientTextClass: 'gradient-text-cat-life' },
    { name: 'Spiritual', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="category-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591L12 12.75V3m0 4.5A2.25 2.25 0 0014.25 9.75A2.25 2.25 0 0012 12.007 2.25 2.25 0 009.75 9.75A2.25 2.25 0 0012 7.507z" /></svg>', id: 'spiritual', gradientBgClass: 'gradient-bg-cat-spiritual', gradientTextClass: 'gradient-text-cat-spiritual' },
    { name: 'Love', icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="category-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>', id: 'love', gradientBgClass: 'gradient-bg-cat-love', gradientTextClass: 'gradient-text-cat-love' }
];

const allGradientBgClasses = [defaultMainGradientBgClass, ...categories.map(c => c.gradientBgClass)];
const allGradientTextClasses = [defaultMainGradientTextClass, ...categories.map(c => c.gradientTextClass)];

// --- Function to get category display name by ID ---
function getCategoryDisplayName(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
}

// --- Function to render a single post on the main feed ---
function renderPost(post) {
    const postElement = document.createElement('article');
    // Make the article itself clickable to navigate to post.html
    postElement.className = 'bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fadeIn cursor-pointer';
    postElement.dataset.category = post.category_id;
    postElement.dataset.postId = post.id;

    // Add click event listener to navigate to post.html
    postElement.addEventListener('click', (event) => {
        // Ensure clicks on buttons within the post don't trigger navigation
        if (event.target.closest('button.support-button') || event.target.closest('button.share-button')) {
            return;
        }
        window.location.href = `post.html?id=${post.id}`; // Navigate to post page
    });

    const categoryNameForDisplay = getCategoryDisplayName(post.category_id);

    const categoryPostTagColors = {
        all: 'text-gray-500', tech: 'text-blue-500', life: 'text-green-500',
        spiritual: 'text-purple-500', love: 'text-pink-500'
    };
    const categoryColorClass = categoryPostTagColors[post.category_id] || 'text-gray-500';

    const date = new Date(post.created_at);
    const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + ', ' +
                          date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

    // Sanitize title, user_name, and story before inserting into HTML
    const safeTitle = post.title ? post.title.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "No Title";
    const safeUserName = (post.user_name || 'Anonymous').replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // For the feed, we'll keep the story snippet concise and handle full story on post.html
    const storySnippet = post.story ? post.story.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, ' ') : "";


    postElement.innerHTML = `
        <div class="flex items-start sm:items-center mb-3">
            <div>
                <span class="font-semibold text-md sm:text-lg text-gray-800">${safeUserName}</span>
                <span class="block text-xs ${categoryColorClass} font-medium mt-0.5">#${categoryNameForDisplay}</span>
            </div>
            <span class="text-xs text-gray-500 ml-auto whitespace-nowrap pl-2">${formattedDate}</span>
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

// --- Function to fetch and display all posts ---
async function fetchAndDisplayPosts() {
    if (!postFeed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/posts`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts = await response.json();

        postFeed.innerHTML = ''; // Clear previous posts
        if (Array.isArray(posts) && posts.length > 0) {
            posts.forEach(post => {
                const postElement = renderPost(post);
                postFeed.appendChild(postElement);
            });
        } else {
            postFeed.innerHTML = '<p class="text-center text-gray-500 py-10">No stories shared yet. Be the first!</p>';
        }
        addInteractiveButtonListeners(); // Re-attach listeners for new buttons
    } catch (error) {
        console.error("Could not fetch posts:", error);
        postFeed.innerHTML = `<p class="text-center text-red-500 py-10">Could not load posts. Is the backend server running? <br><small>${error.message}</small></p>`;
    }
}

// --- Category Bar and Theme Logic ---
categories.forEach((cat, index) => {
    const catItem = document.createElement('div');
    catItem.className = 'category-item';
    if (index === 0) { // 'All' category active by default
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

        const newBgGradient = this.dataset.gradientBgClass;
        const newTextGradient = this.dataset.gradientTextClass;
        allGradientBgClasses.forEach(cls => {
            if (fabElement) fabElement.classList.remove(cls);
            if (submitPostButton) submitPostButton.classList.remove(cls);
        });
        allGradientTextClasses.forEach(cls => {
            if (siteTitleElement) siteTitleElement.classList.remove(cls);
        });

        if (siteTitleElement) siteTitleElement.classList.add(newTextGradient);
        if (fabElement) fabElement.classList.add(newBgGradient);
        if (submitPostButton) submitPostButton.classList.add(newBgGradient);


        const selectedCatId = this.dataset.categoryId;
        if (postFeed) {
            let hasVisiblePosts = false;
            document.querySelectorAll('#postFeed article').forEach(postArticle => {
                if (selectedCatId === 'all' || postArticle.dataset.category === selectedCatId) {
                    postArticle.style.display = 'block';
                    hasVisiblePosts = true;
                } else {
                    postArticle.style.display = 'none';
                }
            });
            if (!hasVisiblePosts && selectedCatId !== 'all') {
                 postFeed.innerHTML = `<p class="text-center text-gray-500 py-10">No stories found in the "${getCategoryDisplayName(selectedCatId)}" category yet.</p>`;
            } else if (!hasVisiblePosts && selectedCatId === 'all' && document.querySelectorAll('#postFeed article').length === 0) {
                 postFeed.innerHTML = '<p class="text-center text-gray-500 py-10">No stories shared yet. Be the first!</p>';
            }
        }
    });
    if (categoryBar) categoryBar.appendChild(catItem);

    if (cat.id !== 'all' && postCategorySelect) {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        postCategorySelect.appendChild(option);
    }
});
if (postCategorySelect && postCategorySelect.options.length > 0 && categories.length > 1) {
    postCategorySelect.value = categories[1].id;
}


// --- Dialog Functionality ---
const openDialogButtonFab = document.getElementById('openCreatePostDialogFab');
const closeDialogButton = document.getElementById('closeCreatePostDialog');
const createPostDialog = document.getElementById('createPostDialog');

function openDialog() {
    if (createPostDialog) {
        const activeCategoryItem = categoryBar.querySelector('.category-item.active');
        const currentBgGradient = activeCategoryItem ? activeCategoryItem.dataset.gradientBgClass : defaultMainGradientBgClass;

        allGradientBgClasses.forEach(cls => {
            if (submitPostButton) submitPostButton.classList.remove(cls);
        });
        if (submitPostButton) submitPostButton.classList.add(currentBgGradient);

        createPostDialog.showModal();
        document.body.classList.add('overflow-hidden'); // Prevent background scroll
    }
}
function closeDialog() {
    if (createPostDialog) {
        createPostDialog.close(); // This will also trigger the 'close' event listener below
    }
}

if (openDialogButtonFab) openDialogButtonFab.addEventListener('click', openDialog);
if (closeDialogButton) closeDialogButton.addEventListener('click', closeDialog);

if (createPostDialog) {
    createPostDialog.addEventListener('click', (event) => {
        if (event.target === createPostDialog) closeDialog(); // Close if backdrop is clicked
    });
    createPostDialog.addEventListener('close', () => {
        if (createPostForm) createPostForm.reset();
        if (postCategorySelect && categories.length > 1) {
            postCategorySelect.value = categories[1].id;
        }
        document.body.classList.remove('overflow-hidden'); // Restore background scroll
    });
}


// --- Handle New Post Submission ---
if (createPostForm) {
    createPostForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const userName = document.getElementById('userName').value.trim();
        const titleInput = document.getElementById('postTitle');
        if (!titleInput) {
            console.error("Title input field not found!");
            alert("An error occurred: Title field is missing.");
            return;
        }
        const title = titleInput.value.trim();
        const story = document.getElementById('userStory').value.trim();
        const categoryId = document.getElementById('postCategory').value;

        if (title === '' || story === '' || categoryId === '') {
            alert('Title, story, and category are required!');
            return;
        }

        const postData = {
            user_name: userName || 'Anonymous',
            title: title,
            story: story,
            category_id: categoryId
        };

        const originalButtonText = submitPostButton.textContent;
        submitPostButton.textContent = 'Sharing...';
        submitPostButton.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Backend should return the full new post object, including id and created_at
            const newPostFromServer = await response.json();

            // Instead of re-fetching all, prepend the new post and update UI
            if (postFeed && newPostFromServer && newPostFromServer.id) {
                 // If "No stories" message is present, remove it
                const noPostsMessage = postFeed.querySelector('p.text-center.text-gray-500');
                if (noPostsMessage) noPostsMessage.remove();

                const postElement = renderPost(newPostFromServer);
                postFeed.prepend(postElement); // Add to the top of the feed
                addInteractiveButtonListeners(); // Re-attach listeners for the new post's buttons
            } else {
                // Fallback if server doesn't return full post, refresh all
                fetchAndDisplayPosts();
            }

            closeDialog(); // Will reset form via its 'close' event listener
        } catch (error) {
            console.error('Failed to create post:', error);
            alert(`Failed to create post: ${error.message}`);
        } finally {
            submitPostButton.textContent = originalButtonText;
            submitPostButton.disabled = false;
        }
    });
}

// --- Handle Support and Share Button Clicks (Event Delegation for dynamic content) ---
function addInteractiveButtonListeners() {
    // Support Buttons
    document.querySelectorAll('.support-button').forEach(button => {
        // Clone and replace to ensure old listeners are removed if this function is called multiple times
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', async function(event) {
            event.stopPropagation(); // Prevent card click navigation
            const postId = this.dataset.postIdSupport;
            if (!postId) return;

            if (this.classList.contains('supported-by-user') || this.disabled) return;
            this.disabled = true;

            try {
                const response = await fetch(`${API_BASE_URL}/posts/${postId}/support`, { method: 'PUT' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                const countElement = this.querySelector('.support-count');
                if (countElement) countElement.textContent = `(${data.new_support_count})`;

                this.classList.add('supported-by-user', 'text-[#EF4444]');
                const heartIcon = this.querySelector('svg');
                if (heartIcon) heartIcon.style.fill = '#EF4444';
                // Keep button disabled after successful support for this session
            } catch (error) {
                console.error('Failed to support post:', error);
                this.disabled = false; // Re-enable on error
            }
        });
    });

    // Share Buttons
    document.querySelectorAll('.share-button').forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent card click navigation
            const postId = this.dataset.postIdShare;
            const postTitle = this.dataset.postTitleShare || "Check out this story on SantWoo";
            const shareUrl = `${window.location.origin}/post.html?id=${postId}`;

            if (navigator.share) {
                navigator.share({ title: postTitle, text: `Check out: ${postTitle}`, url: shareUrl })
                  .then(() => console.log('Successful share'))
                  .catch((error) => console.log('Error sharing:', error));
            } else {
                prompt("Copy this link to share:", shareUrl); // Fallback
            }
        });
    });
}


// --- Initial Page Load ---
function initializeApp() {
    fetchAndDisplayPosts();
    if (document.getElementById('currentYear')) {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }
    // Set default theme for FAB and submit button if not already set by category selection
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Style for fadeIn animation & line-clamp
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
