// index.js
require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer'); // Make sure to require nodemailer
const app = express();
const cors = require('cors');
app.use(express.json()); // For parsing application/json
const crypto = require('crypto');

// Enable CORS for all routes
app.use(cors());

const users = {};


// Reset a user's confirmed status (for testing purposes)
// You can place this in your code where it can be executed once to reset the status
const userEmailToReset = 'olagunjujerry@gmail.com';
if (users[userEmailToReset]) {
  users[userEmailToReset].confirmed = false;
  console.log(`Reset confirmed status for: ${userEmailToReset}`);
}

// Transporter object using the default SMTP transport  
// const { name, user_email, subject, message } = req.body;
let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_EMAIL_ADDRESS,
        pass: process.env.SMTP_PASS,
    },
});


// Function to generate a unique token
function generateToken() {
  return crypto.randomBytes(20).toString('hex');
}

// Function to send a confirmation email with a link
function sendConfirmationEmail(email, token) {
  const confirmationUrl = `http://localhost:3000/confirm-email/${token}`;

  let mailOptions = {
    from: `"Correct" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Confirm Your Email',
    text: `Please click on the following link to confirm your email: ${confirmationUrl}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error(error);
    }
    console.log(`Confirmation email sent to ${email}: ${info.messageId}`);
  });
}

// Registration endpoint
app.post('/register', (req, res) => {
  const { email } = req.body;
  const token = generateToken();
  users[email] = { email, token, confirmed: false }; // Store user with token

  sendConfirmationEmail(email, token);
  res.status(200).json({ message: "Registration successful, confirmation email sent." });
});

// Email confirmation endpoint
app.get('/confirm-email', (req, res) => {
  const { token } = req.query;
  console.log("Received token for confirmation:", token);

  // Find the user associated with the token
  const user = Object.values(users).find(user => user.token === token);

  if (!user) {
    console.log("No user found for token:", token);
    return res.status(400).send("Invalid or expired token.");
  }

  console.log("User found for token:", user.email);
  console.log("User confirmed status:", user.confirmed);
  console.log("User stored token:", user.token);

  // Check if the token matches and the user isn't already confirmed
  if (user.token === token && !user.confirmed) {
    user.confirmed = true;
    console.log("Email confirmed for user:", user.email);
    return res.send("Email successfully confirmed!");
  } else {
    if (user.token !== token) {
      console.log("Token mismatch for user:", user.email);
    }
    if (user.confirmed) {
      console.log("User already confirmed:", user.email);
    }
    return res.status(400).send("Invalid or expired token.");
  }
});



const port = 3001;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// // Function to send an email with the OTP
// const sendOtpEmail = (email, otp) => {
//     let mailOptions = {
//       from: `"Correct" <${process.env.FROM_EMAIL}>`, // Fixed template literal
//       to: process.env.TO_EMAIL, // Send to the email provided by the user
//       subject: 'Your OTP',
//       text: `Your OTP is: ${otp}`,
//     };
  
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         return console.log(error);
//       }
//       console.log('Message sent: %s', info.messageId);
//     });
//   };

// // Placeholder for checking user details
// app.post('/checkdetails', (req, res) => {
//   // In a real application, you would check the database here
//   console.log(req.body); // Log the user data to the console
//   // Respond with a success status and a message
//   res.status(200).json({ message: "Details checked", detailsValid: true });
// });

// // This would be replaced by a proper database in a real application
// const otpStore = {};

// // Function to generate a simple OTP
// function generateOTP() {
//   const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit random number
//   return otp.toString();
// }

// // Endpoint to generate and "send" an OTP
// app.post('/generateOTP', (req, res) => {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }
//     const otp = generateOTP();
//     otpStore[email] = otp;
//     console.log(`OTP for ${email}: ${otp}`);
    
//     // Call the send email function here
//     sendOtpEmail(email, otp);
  
//     res.status(200).json({ message: "OTP generated and sent" });
//   });

// // Endpoint to verify the OTP
// app.post('/verifyOTP', (req, res) => {
//     const { email, otp } = req.body;
//     if (!email || !otp) {
//       return res.status(400).json({ message: "Email and OTP are required" });
//     }
    
//     // Retrieve the stored OTP for the email
//     const storedOtp = otpStore[email];
    
//     // Check if provided OTP matches the stored one
//     if (otp === storedOtp) {
//       // If the OTP is correct, we clear the stored OTP and proceed to registration
//       delete otpStore[email];
//       res.status(200).json({ message: "OTP verified", verified: true });
//     } else {
//       // If the OTP does not match, we respond with an error
//       res.status(401).json({ message: "Invalid OTP", verified: false });
//     }
//   });