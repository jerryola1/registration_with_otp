// index.js
require('dotenv').config();
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

// Function to send an email with the OTP
const sendOtpEmail = (email, otp) => {
    let mailOptions = {
      from: '"CORRECT" <${process.env.FROM_EMAIL}>', // sender address
      to: process.env.TO_EMAIL, // list of receivers
      subject: 'Your OTP', // Subject line
      text: `Your OTP is: ${otp}`, // plain text body
      // html: `<b>Your OTP is: ${otp}</b>` // html body
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    });
  };

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


// Endpoint to verify the OTP
app.post('/verifyOTP', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    
    // Retrieve the stored OTP for the email
    const storedOtp = otpStore[email];
    
    // Check if provided OTP matches the stored one
    if (otp === storedOtp) {
      // If the OTP is correct, we clear the stored OTP and proceed to registration
      delete otpStore[email];
      res.status(200).json({ message: "OTP verified", verified: true });
    } else {
      // If the OTP does not match, we respond with an error
      res.status(401).json({ message: "Invalid OTP", verified: false });
    }
  });

// Transporter object using the default SMTP transport  
const { name, user_email, subject, message } = req.body;
let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS,
    },
});