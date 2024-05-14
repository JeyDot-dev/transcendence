require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'test_pongjs')));

// Define routes
app.get('/', (req, res) => {
	res.send(200).sendFile(path.join(__dirname, 'test_pongjs', 'index.html'));
});

// Start the server
const port = process.env.PORT
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});