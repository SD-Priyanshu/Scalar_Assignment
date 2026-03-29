// Checklist Item Routes
const express = require('express');
const checklistController = require('../controllers/checklistController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router({ mergeParams: true });

/**
 * @route   POST /api/cards/:cardId/checklist
 * @desc    Create a checklist item for a card
 * @body    {text: string}
 */
router.post('/', asyncHandler(checklistController.createChecklistItem));

/**
 * @route   GET /api/cards/:cardId/checklist
 * @desc    Get all checklist items for a card
 */
router.get('/', asyncHandler(checklistController.getChecklistItemsByCardId));

/**
 * @route   GET /api/cards/:cardId/checklist/progress
 * @desc    Get checklist progress for a card
 * @returns {progress: {total, completed, percentage}}
 *
 * IMPORTANT: Must be defined BEFORE /:itemId so Express does not treat
 * the literal string "progress" as an itemId parameter.
 */
router.get('/progress', asyncHandler(checklistController.getChecklistProgress));

/**
 * @route   GET /api/checklist/:itemId
 * @desc    Get a checklist item by ID
 */
router.get('/:itemId', asyncHandler(checklistController.getChecklistItemById));

/**
 * @route   PATCH /api/checklist/:itemId
 * @desc    Update a checklist item
 * @body    {text?: string, done?: boolean}
 */
router.patch('/:itemId', asyncHandler(checklistController.updateChecklistItem));

/**
 * @route   DELETE /api/checklist/:itemId
 * @desc    Delete a checklist item
 */
router.delete('/:itemId', asyncHandler(checklistController.deleteChecklistItem));

module.exports = router;