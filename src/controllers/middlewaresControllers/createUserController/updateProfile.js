const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generate: uniqueId } = require('shortid');

const updateProfile = async (userModel, req, res) => {
  const User = mongoose.model(userModel);
  const UserPassword = mongoose.model(userModel + 'Password');

  const reqUserName = userModel.toLowerCase();
  const userProfile = req[reqUserName];

  // Handle password change if provided
  if (req.body.newPassword && req.body.currentPassword) {
    try {
      console.log('🔐 Password change requested for user:', userProfile._id);
      
      // Verify current password
      const userPassword = await UserPassword.findOne({ user: userProfile._id, removed: false });
      
      if (!userPassword) {
        console.log('❌ Password document not found for user:', userProfile._id);
        return res.status(404).json({
          success: false,
          message: 'Password not found',
        });
      }

      console.log('🔍 Verifying current password...');
      // Use salt + password for verification (matching the original hashing method)
      const isMatch = await bcrypt.compare(userPassword.salt + req.body.currentPassword, userPassword.password);
      
      if (!isMatch) {
        console.log('❌ Current password verification failed');
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      console.log('✅ Current password verified, updating to new password...');
      
      // Update password using the same salt + password method for consistency
      const salt = uniqueId();
      const hashedPassword = bcrypt.hashSync(salt + req.body.newPassword);
      
      const updatedPassword = await UserPassword.findOneAndUpdate(
        { user: userProfile._id, removed: false },
        { 
          password: hashedPassword,
          salt: salt,
          emailVerified: true // Ensure email is verified
        },
        { new: true }
      );

      if (!updatedPassword) {
        console.log('❌ Failed to update password in database');
        return res.status(500).json({
          success: false,
          message: 'Failed to update password',
        });
      }

      console.log('✅ Password updated successfully for user:', userProfile._id);
    } catch (error) {
      console.error('❌ Error updating password:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating password: ' + error.message,
      });
    }
  }

  // Build updates object with all provided fields
  let updates = {};
  
  if (req.body.email) updates.email = req.body.email;
  if (req.body.name) updates.name = req.body.name;
  if (req.body.surname) updates.surname = req.body.surname;
  if (req.body.firstName) updates.name = req.body.firstName;
  if (req.body.lastName) updates.surname = req.body.lastName;
  if (req.body.photo) updates.photo = req.body.photo;
  if (req.body.role) updates.role = req.body.role;
  if (req.body.phone) updates.phone = req.body.phone;
  if (req.body.bio) updates.bio = req.body.bio;
  if (req.body.address) updates.address = req.body.address;

  // Find document by id and updates with the required fields
  const result = await User.findOneAndUpdate(
    { _id: userProfile._id, removed: false },
    { $set: updates },
    {
      new: true, // return the new result instead of the old one
    }
  ).exec();

  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No profile found by this id: ' + userProfile._id,
    });
  }
  
  return res.status(200).json({
    success: true,
    result: {
      _id: result?._id,
      enabled: result?.enabled,
      email: result?.email,
      name: result?.name,
      surname: result?.surname,
      photo: result?.photo,
      role: result?.role,
      phone: result?.phone,
      bio: result?.bio,
      address: result?.address,
    },
    message: 'Profile updated successfully',
  });
};

module.exports = updateProfile;
