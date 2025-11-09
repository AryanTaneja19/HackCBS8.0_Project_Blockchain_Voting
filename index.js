const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// ✅ Fixed Authorization Middleware
const authorizeUser = (req, res, next) => {
  console.log("Incoming token param:", req.query.token); 
  // Accept token either via header or URL query
  const authHeader = req.headers.authorization || req.query.token;

  if (!authHeader) {
    return res.status(401).send('<h1 align="center">Login to Continue</h1>');
  }

  // If it's "Bearer <token>", extract the token part
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  try {
    // Verify and decode token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY, {
      algorithms: ['HS256'],
    });

    req.user = decodedToken; // store decoded user in request
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).send('<h1 align="center">Invalid or Expired Token</h1>');
  }
};

// ✅ Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/login.html'));
});

app.get('/js/login.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/login.js'));
});

app.get('/css/login.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/login.css'));
});

app.get('/css/index.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/index.css'));
});

app.get('/css/admin.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/admin.css'));
});

app.get('/assets/eth5.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets/eth5.jpg'));
});

app.get('/js/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/app.js'));
});

// ✅ Protected Routes
app.get('/admin.html', authorizeUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/admin.html'));
});

app.get('/index.html', authorizeUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/index.html'));
});

// ✅ Dist Files
app.get('/dist/login.bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dist/login.bundle.js'));
});

app.get('/dist/app.bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dist/app.bundle.js'));
});

// ✅ Favicon
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/favicon.ico'));
});

// ✅ Start the Server
app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080');
});
