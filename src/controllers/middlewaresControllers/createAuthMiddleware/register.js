const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res, { userModel }) => {
  try {
    const UserPassword = mongoose.model(userModel + 'Password');
    const User = mongoose.model(userModel);

    const { email, password, name, surname } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Email, password, and name are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase(), removed: false });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'An account with this email already exists',
      });
    }

    // Create new user with employee role by default
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      surname: surname || '',
      role: 'employee',
      enabled: true, // Auto-enable employee accounts
      removed: false,
    });

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const saltString = salt.toString();
    const hashedPassword = await bcrypt.hash(saltString + password, 10);

    // Create password entry
    await UserPassword.create({
      user: user._id,
      password: hashedPassword,
      salt: saltString,
      emailVerified: true,
      removed: false,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '72h' }
    );

    // Return success response with token
    res.status(201).json({
      success: true,
      result: {
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        enabled: user.enabled,
      },
      token,
      message: 'Employee account created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'An account with this email already exists',
      });
    }

    res.status(500).json({
      success: false,
      result: null,
      message: 'Error creating account. Please try again.',
      error: error.message,
    });
  }
};

module.exports = register;
