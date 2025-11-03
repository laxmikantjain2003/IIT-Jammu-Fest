const User = require('../models/user');
const UnverifiedUser = require('../models/UnverifiedUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('../database'); // Import 'Op' from database.js

/**
 * @description Stage 1 of Registration: Send an OTP to the user's email.
 * Creates a temporary record in the 'unverified_users' table.
 */
exports.sendVerificationOTP = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // 1. Check if email is already in the final User table
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
        return res.status(400).json({ message: "This email is already registered and verified." });
    }

    // 2. Generate OTP and expiry (5 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; 

    // 3. Save or update data in the temporary UnverifiedUser table
    // 'upsert' will create a new entry or update an existing one based on the email
    await UnverifiedUser.upsert({
        email: email,
        name: name,
        otp: otp,
        otpExpires: otpExpires,
    });

    // 4. Send email
    const message = `Your IIT Jammu Fest verification code is: ${otp}. This code will expire in 5 minutes.`;
    await sendEmail({
        email: email,
        subject: 'IIT Jammu Fest Email Verification',
        message: message,
    });

    res.status(200).json({ message: "OTP sent successfully. Check your email." });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Server error while sending OTP." });
  }
};

/**
 * @description Stage 2 of Registration: Verify the OTP sent to the email.
 * This checks the 'unverified_users' table.
 */
exports.verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // 1. Find the temporary user record
        const tempUser = await UnverifiedUser.findOne({ where: { email: email } });
        
        if (!tempUser) {
            return res.status(404).json({ message: 'Verification failed: User record not found. Please resend OTP.' });
        }

        // 2. Check if OTP has expired
        if (tempUser.otpExpires < Date.now()) {
            await tempUser.destroy(); // Clean up expired record
            return res.status(400).json({ message: 'Verification failed: OTP has expired.' });
        }

        // 3. Check if OTP matches
        if (tempUser.otp !== otp) {
            return res.status(401).json({ message: 'Verification failed: Invalid OTP.' });
        }

        // 4. Verification successful!
        res.status(200).json({ message: 'Email verified successfully.', name: tempUser.name, email: tempUser.email });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
};

/**
 * @description Stage 3 of Registration: Final step after OTP is verified.
 * Creates the permanent user in the 'users' table and deletes the temporary record.
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, mobile } = req.body;

    // 1. Check if a final user already exists (double check)
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered." });
    }
    
    // 2. Check if mobile number already exists (if provided)
    if (mobile) {
      const existingMobile = await User.findOne({ where: { mobile: mobile } });
      if (existingMobile) {
        return res.status(400).json({ message: "This mobile number is already registered." });
      }
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the final user record, now verified
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      mobile: mobile || null,
      isVerified: true, 
    });

    // 5. Clean up the temporary record
    await UnverifiedUser.destroy({ where: { email: email } });

    // 6. Send a success response
    res.status(201).json({ 
      message: "Final registration successful. You can now log in.", 
      userId: newUser.id 
    });

  } catch (error) {
    console.error("Final registration error:", error);
    res.status(500).json({ message: "Server error during final registration." });
  }
};

/**
 * @description Logs in a verified user.
 * Checks credentials and returns a JWT token and user data (including profile pic).
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ 
      where: { email: email }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Note: The 'isVerified' check from older versions is no longer needed here,
    // because the 'register' function only creates users who are already verified.
    
    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    
    // Ensure profilePicUrl is null, not undefined, if it doesn't exist
    const profilePicUrl = user.profilePicUrl || null; 
    
    // Create JWT Payload
    const payload = {
      id: user.id,
      name: user.name,
      role: user.role,
      profilePicUrl: profilePicUrl 
    };

    // Sign the token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' } 
    );
    
    // Send response
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicUrl: profilePicUrl 
      }
    });
  } catch (error) {
    console.error("Login server crash error:", error); 
    res.status(500).json({ message: "Server error during login." });
  }
};


/**
 * @description Handles the 'Forgot Password' request.
 * Finds a user, generates a reset token, and emails them a reset link.
 */
exports.forgotPassword = async (req, res) => {
  let user; 
  try {
    user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Generate a random token using Node.js crypto module
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the token and save it to the database
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Create the frontend reset URL
    const resetUrl = `${req.protocol}://localhost:3000/reset-password/${resetToken}`;
    
    const message = `
      You are receiving this email because you (or someone else) requested a password reset for your account.
      Please click on the following link, or paste it into your browser to complete the process:
      
      ${resetUrl}
      
      This link will expire in 10 minutes.
      If you did not request this, please ignore this email.
    `;
    
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: message,
    });

    res.status(200).json({ message: 'Email sent successfully.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    // If email sending fails, clear the token from the database
    if (user) { 
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
    }
    res.status(500).json({ message: 'Error sending email.' });
  }
};


/**
 * @description Handles the 'Reset Password' submission.
 * Verifies the token from the URL and saves the new password.
 */
exports.resetPassword = async (req, res) => {
  try {
    // 1. Hash the token from the URL to match the one in the DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2. Find user by the hashed token and check if it's expired
    const user = await User.findOne({
      where: {
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() }, // 'gt' means 'greater than'
// Next, we'll create the controller for all User-specific actions, like managing profile pictures.
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // 3. Set the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // 4. Clear the reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: "Server error during password reset." });
  }
};