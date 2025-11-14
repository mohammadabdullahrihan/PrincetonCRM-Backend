const mongoose = require('mongoose');

// Ensure the Admin model is loaded
require('../../models/coreModels/Admin');
const Admin = mongoose.model('Admin');

const employeeController = {
  // List all employees (admin only)
  list: async (req, res) => {
    try {
      // Check if user is admin or owner
      if (req.admin.role !== 'admin' && req.admin.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const employees = await Admin.find({ removed: false })
        .select('-__v')
        .sort({ created: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Admin.countDocuments({ removed: false });

      res.json({
        success: true,
        result: employees,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get single employee details
  read: async (req, res) => {
    try {
      // Check if user is admin or owner
      if (req.admin.role !== 'admin' && req.admin.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      const employee = await Admin.findOne({
        _id: req.params.id,
        removed: false,
      }).select('-__v');

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }

      res.json({
        success: true,
        result: employee,
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Update employee role (admin/owner only)
  updateRole: async (req, res) => {
    try {
      // Only owner can change roles
      if (req.admin.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only owner can change roles.',
        });
      }

      const { role } = req.body;

      if (!role || !['owner', 'admin', 'employee'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be owner, admin, or employee.',
        });
      }

      const employee = await Admin.findOneAndUpdate(
        { _id: req.params.id, removed: false },
        { role },
        { new: true }
      ).select('-__v');

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }

      res.json({
        success: true,
        result: employee,
        message: 'Employee role updated successfully',
      });
    } catch (error) {
      console.error('Error updating employee role:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Update employee status (enable/disable)
  updateStatus: async (req, res) => {
    try {
      // Check if user is admin or owner
      if (req.admin.role !== 'admin' && req.admin.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be true or false.',
        });
      }

      const employee = await Admin.findOneAndUpdate(
        { _id: req.params.id, removed: false },
        { enabled },
        { new: true }
      ).select('-__v');

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }

      res.json({
        success: true,
        result: employee,
        message: `Employee ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error updating employee status:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Delete employee (soft delete)
  remove: async (req, res) => {
    try {
      // Only owner can delete employees
      if (req.admin.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only owner can delete employees.',
        });
      }

      const employee = await Admin.findOneAndUpdate(
        { _id: req.params.id, removed: false },
        { removed: true },
        { new: true }
      );

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }

      res.json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // Get employee statistics
  summary: async (req, res) => {
    try {
      // Check if user is admin or owner
      if (req.admin.role !== 'admin' && req.admin.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      const total = await Admin.countDocuments({ removed: false });
      const active = await Admin.countDocuments({ removed: false, enabled: true });
      const inactive = await Admin.countDocuments({ removed: false, enabled: false });
      
      const byRole = await Admin.aggregate([
        { $match: { removed: false } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);

      const roleStats = {
        owner: 0,
        admin: 0,
        employee: 0,
      };

      byRole.forEach(item => {
        roleStats[item._id] = item.count;
      });

      res.json({
        success: true,
        result: {
          total,
          active,
          inactive,
          byRole: roleStats,
        },
      });
    } catch (error) {
      console.error('Error fetching employee summary:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = employeeController;
