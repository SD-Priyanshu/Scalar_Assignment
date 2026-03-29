// List Routes
const express = require('express');
const listController = require('../controllers/listController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router({ mergeParams: true });

/**
 * @route   POST /api/boards/:boardId/lists
 * @desc    Create a new list in a board
 */
router.post('/', asyncHandler(listController.createList));

/**
 * @route   GET /api/boards/:boardId/lists
 * @desc    Get all lists for a board
 */
router.get('/', asyncHandler(listController.getListsByBoardId));

/**
 * @route   PATCH /api/boards/:boardId/lists/reorder
 * @desc    Reorder lists (drag and drop)
 * @body    {lists: Array<{id: string, order: number}>}
 *
 * IMPORTANT: This route MUST be defined before /:listId to prevent Express
 * from interpreting the literal string "reorder" as a listId parameter.
 */
router.patch('/reorder', asyncHandler(listController.reorderLists));

/**
 * @route   PATCH /api/lists/:listId/archive
 * @desc    Archive a list
 */
router.patch('/:listId/archive', asyncHandler(listController.archiveList));

/**
 * @route   GET /api/lists/:listId
 * @desc    Get a list by ID
 */
router.get('/:listId', asyncHandler(listController.getListById));

/**
 * @route   PATCH /api/lists/:listId
 * @desc    Update a list (title and/or order)
 * @body    {title?: string, order?: number}
 */
router.patch('/:listId', asyncHandler(listController.updateList));

/**
 * @route   DELETE /api/lists/:listId
 * @desc    Delete a list
 */
router.delete('/:listId', asyncHandler(listController.deleteList));

module.exports = router;