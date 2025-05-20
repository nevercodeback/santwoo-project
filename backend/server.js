// File: santwoo_project/backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables
const db = require('./db'); // Your database connection pool

// Import middleware
const { protect } = require('./middleware/authMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- API Routes ---

// Authentication routes
app.use('/api/auth', authRoutes);

// --- Posts Routes (Modified) ---

// GET all posts (Publicly accessible)
app.get('/api/posts', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, 
                p.title, 
                p.story, 
                p.category_id, 
                p.support_count, 
                p.created_at, 
                /* p.updated_at, -- REMOVED as it's not in your schema */
                u.santwoo_name AS author_santwoo_name, 
                u.first_name AS author_first_name,
                p.user_name AS legacy_user_name
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `;
        const [posts] = await db.query(query);

        const processedPosts = posts.map(post => ({
            ...post,
            user_name: post.author_santwoo_name || post.legacy_user_name || 'Anonymous',
        }));

        res.status(200).json(processedPosts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Failed to fetch posts", error: error.message });
    }
});

// GET a single post by ID (Publicly accessible)
app.get('/api/posts/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const query = `
            SELECT 
                p.id, 
                p.title, 
                p.story, 
                p.category_id, 
                p.support_count, 
                p.created_at, 
                /* p.updated_at, -- REMOVED as it's not in your schema */
                u.santwoo_name AS author_santwoo_name,
                u.first_name AS author_first_name,
                p.user_name AS legacy_user_name
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `;
        const [posts] = await db.query(query, [postId]);

        if (posts.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }
        const post = posts[0];
        const processedPost = {
            ...post,
            user_name: post.author_santwoo_name || post.legacy_user_name || 'Anonymous',
        };
        res.status(200).json(processedPost);
    } catch (error) {
        console.error(`Error fetching post ${postId}:`, error);
        res.status(500).json({ message: "Failed to fetch post", error: error.message });
    }
});

// POST a new story (Protected Route)
app.post('/api/posts', protect, async (req, res) => {
    const userId = req.user.userId;
    const { title, story, category_id } = req.body;

    if (!title || !story || !category_id) {
        return res.status(400).json({ message: "Title, story, and category are required." });
    }
    if (!userId) {
        return res.status(401).json({ message: "User not authenticated." });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO posts (user_id, title, story, category_id, support_count) VALUES (?, ?, ?, ?, ?)',
            [userId, title, story, category_id, 0]
        );
        const newPostId = result.insertId;

        const query = `
            SELECT 
                p.id, p.title, p.story, p.category_id, p.support_count, p.created_at,
                /* p.updated_at, -- REMOVED as it's not in your schema */
                u.santwoo_name AS author_santwoo_name,
                u.first_name AS author_first_name
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `;
        const [newPostArray] = await db.query(query, [newPostId]);
        
        if (newPostArray.length > 0) {
            const newPost = newPostArray[0];
            const processedPost = {
                ...newPost,
                user_name: newPost.author_santwoo_name || 'Anonymous',
            };
            res.status(201).json(processedPost);
        } else {
            res.status(500).json({ message: "Failed to retrieve the created post." });
        }

    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Failed to create post", error: error.message });
    }
});


// PUT update support count for a post
app.put('/api/posts/:id/support', async (req, res) => {
    const postId = req.params.id;
    try {
        const [posts] = await db.query('SELECT support_count FROM posts WHERE id = ?', [postId]);
        if (posts.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        const [result] = await db.query(
            'UPDATE posts SET support_count = support_count + 1 WHERE id = ?',
            [postId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Post not found or no rows updated." });
        }
        
        const [updatedPosts] = await db.query('SELECT support_count FROM posts WHERE id = ?', [postId]);
        res.status(200).json({ message: "Support count updated", new_support_count: updatedPosts[0].support_count });

    } catch (error) {
        console.error(`Error updating support for post ${postId}:`, error);
        res.status(500).json({ message: "Failed to update support count", error: error.message });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
