// Validation utilities

const validateString = (value, fieldName, options = {}) => {
  const { minLength = 1, maxLength = null, required = true } = options;

  if (required && (!value || typeof value !== 'string')) {
    throw new Error(`${fieldName} is required and must be a string`);
  }

  if (value && typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  if (value && value.trim().length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} character(s)`);
  }

  if (value && maxLength && value.trim().length > maxLength) {
    throw new Error(`${fieldName} must be at most ${maxLength} character(s)`);
  }

  return value ? value.trim() : null;
};

const validateId = (value, fieldName = 'ID') => {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} is required and must be a valid string`);
  }
  return value;
};

const validateInteger = (value, fieldName, options = {}) => {
  const { min = null, max = null, required = false } = options;

  if (required && typeof value === 'undefined') {
    throw new Error(`${fieldName} is required`);
  }

  if (typeof value !== 'undefined' && !Number.isInteger(value)) {
    throw new Error(`${fieldName} must be an integer`);
  }

  if (typeof value !== 'undefined' && min !== null && value < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }

  if (typeof value !== 'undefined' && max !== null && value > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }

  return value;
};

const validateEmail = (value, fieldName = 'Email') => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error(`${fieldName} is not valid`);
  }
  return value.toLowerCase();
};

module.exports = {
  validateString,
  validateId,
  validateInteger,
  validateEmail,
};
