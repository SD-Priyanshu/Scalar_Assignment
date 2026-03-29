// Label Routes

const express = require('express');
const labelController = require('../controllers/labelController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

/**
 * @route   POST /api/labels
 * @desc    Create a new label
 * @body    {name: string, color: string}
 * @returns {label}
 */
router.post('/', asyncHandler(labelController.createLabel));

/**
 * @route   GET /api/labels
 * @desc    Get all labels
 * @returns {labels[]}
 */
router.get('/', asyncHandler(labelController.getAllLabels));

/**
 * @route   GET /api/labels/:labelId
 * @desc    Get a label by ID
 * @params  {labelId: string}
 * @returns {label}
 */
router.get('/:labelId', asyncHandler(labelController.getLabelById));

/**
 * @route   PATCH /api/labels/:labelId
 * @desc    Update a label
 * @params  {labelId: string}
 * @body    {name?: string, color?: string}
 * @returns {label}
 */
router.patch('/:labelId', asyncHandler(labelController.updateLabel));

/**
 * @route   DELETE /api/labels/:labelId
 * @desc    Delete a label
 * @params  {labelId: string}
 * @returns {success: boolean}
 */
router.delete('/:labelId', asyncHandler(labelController.deleteLabel));

module.exports = router;
