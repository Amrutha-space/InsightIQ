const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  dataQuery: Joi.object({
    query: Joi.string().required().messages({
      'any.required': 'SQL query is required'
    }),
    datasetId: Joi.number().integer().positive().required().messages({
      'any.required': 'Dataset ID is required'
    })
  }),

  simulation: Joi.object({
    datasetId: Joi.number().integer().positive().required(),
    parameters: Joi.object().required(),
    scenario: Joi.string().required()
  })
};

module.exports = {
  validateRequest,
  schemas
};
