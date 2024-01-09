// index.js
const express = require('express');
const app = express();
const port = 3001; // Make sure this is a different port from your React app

app.use(express.json()); // For parsing application/json

// Placeholder for checking user details
app.post('/checkdetails', (req, res) => {
  // In a real application, you would check the database here
  console.log(req.body); // Log the user data to the console
  // Respond with a success status and a message
  res.status(200).json({ message: "Details checked", detailsValid: true });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// This would be replaced by a proper database in a real application
const otpStore = {};

// Function to generate a simple OTP
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit random number
  return otp.toString();
}

// Endpoint to generate and "send" an OTP
app.post('/generateOTP', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  // Generate an OTP
  const otp = generateOTP();
  // Store the OTP with the user's email as the key
  otpStore[email] = otp;
  // For the purpose of this example, we will just log the OTP to the console
  console.log(`OTP for ${email}: ${otp}`);
  // In a real app, you would send the OTP via email here

  // Respond with a success status
  res.status(200).json({ message: "OTP generated and sent" });
});

