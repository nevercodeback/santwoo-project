// File: santwoo_project/backend/server.js
// Import necessary packages
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Initialize the Express application
const app = express();

const db = require('./db'); // Import our database connection pool

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Allow the server to understand JSON data in request bodies

// Define the port the server will run on
const PORT = process.env.PORT || 3001; // Use port from .env or default to 3001

// Simple test route
app.get('/', (req, res) => {
    res.send('SantWoo Backend is running!');
});

// API ROUTE: Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        // Ensure title is selected
        const [posts] = await db.query('SELECT id, user_name, title, story, category_id, support_count, created_at FROM posts ORDER BY created_at DESC');
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            message: 'Failed to fetch posts from database.',
            errorDetails: error.message
        });
    }
});

// API ROUTE: Get a single post by ID
app.get('/api/posts/:postId', async (req, res) => {
    const { postId } = req.params;

    if (isNaN(parseInt(postId))) {
        return res.status(400).json({ message: 'Invalid Post ID format.' });
    }

    try {
        const [posts] = await db.query('SELECT id, user_name, title, story, category_id, support_count, created_at FROM posts WHERE id = ?', [postId]);
        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        res.json(posts[0]); // Send the single post object
    } catch (error) {
        console.error(`Error fetching post with ID ${postId}:`, error);
        res.status(500).json({
            message: 'Failed to fetch post.',
            errorDetails: error.message
        });
    }
});


// API ROUTE: Create a new post
app.post('/api/posts', async (req, res) => {
    // Get the data from the request body.
    const { user_name, title, story, category_id } = req.body; // Added title

    // Basic validation: Check if title, story and category_id are provided
    if (!title || !story || !category_id) { // Ensure title is also required
        return res.status(400).json({ message: 'Title, story, and category are required.' });
    }

    try {
        const sql = 'INSERT INTO posts (user_name, title, story, category_id) VALUES (?, ?, ?, ?)';

        const finalUserName = (user_name && user_name.trim() !== '') ? user_name : 'Anonymous';

        const [result] = await db.query(sql, [finalUserName, title, story, category_id]);

        // Fetch the newly created post to return its full data including created_at and support_count (defaults)
        const [newPostArray] = await db.query('SELECT id, user_name, title, story, category_id, support_count, created_at FROM posts WHERE id = ?', [result.insertId]);

        if (newPostArray.length === 0) {
             return res.status(500).json({ message: 'Failed to retrieve the created post.'});
        }

        res.status(201).json(newPostArray[0]); // Return the full new post object

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            message: 'Failed to create post in database.',
            errorDetails: error.message
        });
    }
});


// API ROUTE: Support a post (increment support_count)
app.put('/api/posts/:postId/support', async (req, res) => {
    const { postId } = req.params;

    if (isNaN(parseInt(postId))) {
        return res.status(400).json({ message: 'Invalid Post ID format.' });
    }

    try {
        const [posts] = await db.query('SELECT support_count FROM posts WHERE id = ?', [postId]);
        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const sql = 'UPDATE posts SET support_count = support_count + 1 WHERE id = ?';
        const [result] = await db.query(sql, [postId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Post not found or no change made.' });
        }

        const [updatedPost] = await db.query('SELECT support_count FROM posts WHERE id = ?', [postId]);

        res.json({
            message: 'Post supported successfully!',
            postId: parseInt(postId),
            new_support_count: updatedPost[0].support_count
        });

    } catch (error) {
        console.error('Error supporting post:', error);
        res.status(500).json({
            message: 'Failed to support post.',
            errorDetails: error.message
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});