// File: santwoo_project/frontend/js/post_script.js

document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const postContainer = document.getElementById('postContainer');
    const postLoadingErrorContainer = document.getElementById('postLoadingError');
    const postContentArea = document.getElementById('postContentArea');

    const postTitleEl = document.getElementById('postTitle');
    const postAuthorEl = document.getElementById('postAuthor');
    const postDateEl = document.getElementById('postDate');
    const postCategoryTagEl = document.getElementById('postCategoryTag');
    const postCategoryTagWrapperEl = document.getElementById('postCategoryTagWrapper');
    const postStoryEl = document.getElementById('postStory');
    const supportCountEl = document.getElementById('supportCountSinglePost'); // For the count text
    const currentYearEl = document.getElementById('currentYearPostPage');

    // IMPORTANT: For local development, this MUST be your local backend URL.
    // For live deployment, this MUST be your live backend URL (e.g., 'https://yourdomain.com/api').
    const API_BASE_URL = 'http://localhost:3000/api'; // <<< CHECK AND UPDATE IF YOUR LOCAL PORT IS DIFFERENT

    // Category definitions with Tailwind classes for styling
    const categories = [
        { name: 'Tech', id: 'tech', colorClass: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-300' },
        { name: 'Life', id: 'life', colorClass: 'bg-green-100 text-green-800', borderColor: 'border-green-300' },
        { name: 'Spiritual', id: 'spiritual', colorClass: 'bg-purple-100 text-purple-800', borderColor: 'border-purple-300' },
        { name: 'Love', id: 'love', colorClass: 'bg-pink-100 text-pink-900', borderColor: 'border-pink-300' },
        { name: 'General', id: 'general', colorClass: 'bg-gray-200 text-gray-800', borderColor: 'border-gray-400' }
    ];

    // Function to get category details by ID
    function getCategoryDetails(categoryId) {
        const category = categories.find(c => c.id === categoryId);
        if (category) return category;
        return { name: categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : 'Uncategorized', id: categoryId, colorClass: 'bg-gray-200 text-gray-800', borderColor: 'border-gray-400' };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        showError('Error: Post ID not found in URL.');
        return;
    }

    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    async function fetchAndDisplayPost() {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Post not found. It might have been removed or the link is incorrect.');
                }
                const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while fetching the post.' }));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            const post = await response.json();

            // Ensure post object and essential fields are present
            if (!post || typeof post !== 'object') {
                throw new Error('Received invalid post data from the server.');
            }
            
            document.title = `${(post.title || 'Post').replace(/</g, "&lt;").replace(/>/g, "&gt;")} - SantWoo`; // Added null check for title here too
            renderPostDetails(post);
            postLoadingErrorContainer.classList.add('hidden'); 
            postContentArea.classList.remove('hidden'); 

        } catch (error) {
            console.error("Could not fetch post:", error);
            showError(`Could not load post: ${error.message}`);
        }
    }

    function showError(message) {
        if (postLoadingErrorContainer) {
            postLoadingErrorContainer.innerHTML = `<p class="text-center text-red-600 text-lg p-8 bg-red-50 rounded-lg">${message}</p>`;
            postLoadingErrorContainer.classList.remove('hidden'); 
        }
        if (postContentArea) {
            postContentArea.classList.add('hidden'); 
        }
    }

    function renderPostDetails(post) {
        if (!postTitleEl || !postStoryEl) {
            console.error("Critical HTML elements for post details are missing (e.g., title, story).");
            showError("There was an issue displaying the post content. Required page elements are missing.");
            return;
        }

        const date = new Date(post.created_at);
        const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });

        // **FIX: Add null check for post.title before using .replace()**
        const safeTitle = (post.title || 'No Title').replace(/</g, "&lt;").replace(/>/g, "&gt;");
        postTitleEl.textContent = safeTitle;
        
        if (postAuthorEl) {
             // **FIX: Add null check for post.user_name before using .replace()**
             const safeUserName = (post.user_name || 'Anonymous').replace(/</g, "&lt;").replace(/>/g, "&gt;");
             postAuthorEl.innerHTML = `By <span class="font-semibold text-gray-700">${safeUserName}</span>`;
        }
       
        if (postDateEl) {
            postDateEl.textContent = `${formattedDate} at ${formattedTime}`;
        }

        if (postCategoryTagEl && postCategoryTagWrapperEl) {
            if (post.category_id) {
                const category = getCategoryDetails(post.category_id);
                postCategoryTagEl.textContent = category.name;
                postCategoryTagEl.className = 'font-medium text-xs px-2 py-0.5 rounded-md'; 
                category.colorClass.split(' ').forEach(cls => postCategoryTagEl.classList.add(cls.trim()));
                postCategoryTagWrapperEl.classList.remove('hidden');
            } else {
                postCategoryTagWrapperEl.classList.add('hidden'); 
            }
        }

        // **FIX: Add null check for post.story before using .replace()**
        const storyContent = post.story || ''; // Default to empty string if story is null
        const storyHTML = storyContent
            .replace(/</g, "&lt;") 
            .replace(/>/g, "&gt;")
            .split('\n') 
            .map(para => para.trim() === '' ? '<p class="min-h-[1em]"></p>' : `<p>${para}</p>`) 
            .join(''); 
        postStoryEl.innerHTML = storyHTML;

        if (supportCountEl) {
            supportCountEl.textContent = `(${post.support_count || 0})`;
        }
        const supportButtonElement = document.getElementById('supportButtonSinglePost');
        if (supportButtonElement) {
             supportButtonElement.dataset.postIdSupport = post.id;
        }

        if (sessionStorage.getItem(`supported_${post.id}`)) {
            const currentSupportButton = document.getElementById('supportButtonSinglePost');
            if (currentSupportButton) {
                 markButtonAsSupported(currentSupportButton, post.support_count || 0);
            }
        }

        addSupportButtonListenerSingle(post.id);
        addShareButtonListener(post.id, post.title); // Pass potentially null post.title, handle in addShareButtonListener
    }

    function markButtonAsSupported(button, count) {
        const countElement = button.querySelector('#supportCountSinglePost'); 
        button.classList.add('supported-by-user-single'); 
        if(countElement) countElement.textContent = `(${count})`;
    }

    function addSupportButtonListenerSingle(postId) {
        const currentSupportButton = document.getElementById('supportButtonSinglePost');
        if (!currentSupportButton) return;

        const newSupportButton = currentSupportButton.cloneNode(true);
        currentSupportButton.parentNode.replaceChild(newSupportButton, currentSupportButton);
        
        newSupportButton.addEventListener('click', async function(event) {
            event.preventDefault(); 
            if (this.classList.contains('supported-by-user-single')) {
                console.log("Already supported."); 
                return;
            }
            this.disabled = true; 

            try {
                const response = await fetch(`${API_BASE_URL}/posts/${postId}/support`, {
                    method: 'PUT',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({message: "An unknown error occurred during support action."}));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                markButtonAsSupported(this, data.new_support_count);
                sessionStorage.setItem(`supported_${postId}`, 'true'); 

            } catch (error) {
                console.error('Failed to support post:', error);
                alert(`Failed to support post: ${error.message}`); 
            } finally {
                 this.disabled = false; 
            }
        });
    }

    function addShareButtonListener(postId, postTitle) { // postTitle can be null here
        const currentShareButton = document.getElementById('shareButtonSinglePost');
        if (!currentShareButton) return;

        const newShareButton = currentShareButton.cloneNode(true);
        currentShareButton.parentNode.replaceChild(newShareButton, currentShareButton);

        newShareButton.addEventListener('click', function(event) {
            event.preventDefault();
            const shareUrl = `${window.location.origin}${window.location.pathname}?id=${postId}`;
            // **FIX: Handle potentially null postTitle before .replace()**
            const safePostTitle = postTitle || "Check out this story"; // Default title if null
            const shareTitleText = safePostTitle.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            
            if (navigator.share) {
                navigator.share({
                    title: shareTitleText,
                    text: `Check out: ${shareTitleText}`, 
                    url: shareUrl,
                })
                .then(() => console.log('Successfully shared post.'))
                .catch((error) => console.log('Error sharing post:', error));
            } else {
                prompt("Copy this link to share:", shareUrl);
            }
        });
    }

    fetchAndDisplayPost();
});
