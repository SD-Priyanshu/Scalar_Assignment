// Board Routes

const express = require('express');
const boardController = require('../controllers/boardController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

/**
 * @route   POST /api/boards
 * @desc    Create a new board
 * @body    {title: string}
 * @returns {board}
 */
router.post('/', asyncHandler(boardController.createBoard));

/**
 * @route   GET /api/boards
 * @desc    Get all boards
 * @returns {boards[]}
 */
router.get('/', asyncHandler(boardController.getAllBoards));

/**
 * @route   GET /api/boards/:boardId
 * @desc    Get a board by ID with all lists and cards
 * @params  {boardId: string}
 * @returns {board}
 */
router.get('/:boardId', asyncHandler(boardController.getBoardById));

/**
 * @route   PATCH /api/boards/:boardId
 * @desc    Update a board
 * @params  {boardId: string}
 * @body    {title?: string, background?: string}
 * @returns {board}
 */
router.patch('/:boardId', asyncHandler(boardController.updateBoard));

/**
 * @route   DELETE /api/boards/:boardId
 * @desc    Delete a board
 * @params  {boardId: string}
 * @returns {success: boolean}
 */
router.delete('/:boardId', asyncHandler(boardController.deleteBoard));

module.exports = router;
