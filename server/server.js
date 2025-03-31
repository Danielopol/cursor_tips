const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Data file paths
const csvDataPath = path.join(__dirname, '../data/Cursor.csv');

// Configure email transporter
// Note: For production, use a proper email service, not this example config
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com', // Replace with your SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your_email@example.com', // Replace with your email
    pass: 'your_password' // Replace with your password or app password
  }
});

// Serve the CSV file directly
app.get('/data/Cursor.csv', (req, res) => {
  if (fs.existsSync(csvDataPath)) {
    res.setHeader('Content-Type', 'text/csv');
    fs.createReadStream(csvDataPath).pipe(res);
  } else {
    res.status(404).send('CSV file not found');
  }
});

// Handle form submission and send email
app.post('/api/submit-tip', [
  // Validate input
  check('name').trim().notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Valid email is required'),
  check('title').trim().notEmpty().withMessage('Title is required'),
  check('message').trim().notEmpty().withMessage('Message is required'),
  check('categories').isArray().withMessage('At least one category is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, title, url, categories, message } = req.body;
    
    // Prepare email content
    const mailOptions = {
      from: 'your_email@example.com', // Replace with your email
      to: 'your_receiving_email@example.com', // Where you want to receive submissions
      subject: `New Cursor AI Tip Submission: ${title}`,
      html: `
        <h2>New Tip Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>URL:</strong> ${url || 'Not provided'}</p>
        <p><strong>Categories:</strong> ${categories.join(', ')}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    // Optional: Save submission to a file or database
    const submissionLog = path.join(__dirname, '../data/submissions.json');
    let submissions = [];
    
    if (fs.existsSync(submissionLog)) {
      const data = fs.readFileSync(submissionLog, 'utf8');
      submissions = JSON.parse(data);
    }
    
    submissions.push({
      name,
      email,
      title,
      url,
      categories,
      message,
      date: new Date().toISOString()
    });
    
    fs.writeFileSync(submissionLog, JSON.stringify(submissions, null, 2), 'utf8');
    
    // Send success response
    res.status(200).json({ 
      success: true, 
      message: 'Tip submitted successfully. Thank you for your contribution!' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit tip. Please try again later.' 
    });
  }
});

// Catch-all route to serve the main index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Check if CSV file exists
  if (!fs.existsSync(csvDataPath)) {
    console.warn(`Warning: CSV file not found at ${csvDataPath}`);
    console.warn('Please ensure your Cursor.csv file is placed in the data directory');
  } else {
    console.log(`CSV file found at ${csvDataPath}`);
  }
});