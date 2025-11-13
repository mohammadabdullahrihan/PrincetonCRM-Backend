const { modelNames } = require('../../../models/utils');
const modelsFiles = modelNames;

const mongoose = require('mongoose');

const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./remove');
const search = require('./search');
const filter = require('./filter');
const summary = require('./summary');
const listAll = require('./listAll');
const paginatedList = require('./paginatedList');

const createCRUDController = (modelName) => {
  try {
    if (!modelsFiles.includes(modelName)) {
      console.warn(`Model ${modelName} does not exist in models list`);
      return {
        create: (req, res) =>
          res
            .status(500)
            .json({ success: false, message: `Controller not available for ${modelName}` }),
        read: (req, res) =>
          res
            .status(500)
            .json({ success: false, message: `Controller not available for ${modelName}` }),
        update: (req, res) =>
          res
            .status(500)
            .json({ success: false, message: `Controller not available for ${modelName}` }),
        delete: (req, res) =>
          res
            .status(500)
            .json({ success: false, message: `Controller not available for ${modelName}` }),
        list: (req, res) => res.status(200).json({ success: true, result: [], total: 0 }),
        listAll: (req, res) => res.status(200).json({ success: true, result: [], total: 0 }),
        search: (req, res) => res.status(200).json({ success: true, result: [], total: 0 }),
        filter: (req, res) => res.status(200).json({ success: true, result: [], total: 0 }),
        summary: (req, res) => res.status(200).json({ success: true, result: {} }),
      };
    }

    const Model = mongoose.model(modelName);

    // Helper function to handle errors consistently
    const handleError = (error, operation, res) => {
      console.error(`${modelName} ${operation} error:`, error.message);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: error.message,
        });
      } else if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format',
          error: error.message,
        });
      } else if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Duplicate entry - record already exists',
          error: error.message,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: `Error ${operation} ${modelName}`,
          error: error.message,
        });
      }
    };
    let crudMethods = {
      create: async (req, res, next) => {
        try {
          return await create(Model, req, res, next);
        } catch (error) {
          return handleError(error, 'creating', res);
        }
      },
      read: async (req, res, next) => {
        try {
          return await read(Model, req, res, next);
        } catch (error) {
          return handleError(error, 'reading', res);
        }
      },
      update: async (req, res, next) => {
        try {
          return await update(Model, req, res, next);
        } catch (error) {
          return handleError(error, 'updating', res);
        }
      },
      delete: async (req, res, next) => {
        try {
          return await remove(Model, req, res, next);
        } catch (error) {
          return handleError(error, 'deleting', res);
        }
      },
      list: async (req, res, next) => {
        try {
          return await paginatedList(Model, req, res, next);
        } catch (error) {
          return handleError(error, 'listing', res);
        }
      },
      listAll: async (req, res, next) => {
        try {
          return await listAll(Model, req, res, next);
        } catch (error) {
          return handleError(error, 'listing all', res);
        }
      },
      search: async (req, res, next) => {
        try {
          return await search(Model, req, res, next);
        } catch (error) {
          return handleError(error, 'searching', res);
        }
      },
      filter: async (req, res, next) => {
        try {
          return await filter(Model, req, res, next);
        } catch (error) {
          return handleError(error, 'filtering', res);
        }
      },
      summary: async (req, res, next) => {
        try {
          return await summary(Model, req, res, next);
        } catch (error) {
          return handleError(error, 'getting summary for', res);
        }
      },
    };
    return crudMethods;
  } catch (error) {
    console.error(`Error creating CRUD controller for ${modelName}:`, error.message);
    // Return a safe fallback controller
    return {
      create: (req, res) =>
        res
          .status(500)
          .json({ success: false, message: `Controller not available for ${modelName}` }),
      read: (req, res) =>
        res
          .status(500)
          .json({ success: false, message: `Controller not available for ${modelName}` }),
      update: (req, res) =>
        res
          .status(500)
          .json({ success: false, message: `Controller not available for ${modelName}` }),
      delete: (req, res) =>
        res
          .status(500)
          .json({ success: false, message: `Controller not available for ${modelName}` }),
      list: (req, res) => res.status(200).json({ success: true, result: [], total: 0 }),
      listAll: (req, res) => res.status(200).json({ success: true, result: [], total: 0 }),
      search: (req, res) => res.status(200).json({ success: true, result: [], total: 0 }),
      filter: (req, res) => res.status(200).json({ success: true, result: [], total: 0 }),
      summary: (req, res) => res.status(200).json({ success: true, result: {} }),
    };
  }
};

module.exports = createCRUDController;
