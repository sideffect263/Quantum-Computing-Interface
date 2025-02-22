const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const quantumRouter = require('./routes/quantum');
const timeout = require('connect-timeout');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Ensure this line is present
app.use(timeout('30s')); // Add timeout middleware

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/api/quantum', quantumRouter);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Serve the frontend interface
app.get('/', (req, res) => {
  res.render('index', { cssFile: 'styles/tailwind.css' });
});

// Serve the About page
app.get('/about', (req, res) => {
  res.render('about');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
