// Card Search & Filter Routes
// Mounted at: /api
const express = require('express');
const cardSearchController = require('../controllers/cardSearchController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

/**
 * @route   GET /api/cards/search/stats
 * @desc    Get search statistics and label distribution
 * @returns {statistics}
 */
router.get('/cards/search/stats', asyncHandler(cardSearchController.getSearchStatistics));

/**
 * @route   GET /api/boards/:boardId/cards/search
 * @desc    Search and filter cards by multiple criteria
 * @params  {boardId: string}
 * @query   {q, labelIds, memberNames, dueDateStart, dueDateEnd}
 * @returns {cards[]}
 */
router.get('/boards/:boardId/cards/search', asyncHandler(cardSearchController.searchAndFilterCards));

/**
 * @route   GET /api/cards/search?q=query
 * @desc    Search cards by title
 * @query   {q: search-query (required)}
 * @returns {cards[]}
 */
router.get('/cards/search', asyncHandler(cardSearchController.searchByTitle));

/**
 * @route   GET /api/lists/:listId/cards/search?q=query
 * @desc    Search cards in a list by title
 * @params  {listId: string}
 * @query   {q: search-query (required)}
 * @returns {cards[]}
 */
router.get('/lists/:listId/cards/search', asyncHandler(cardSearchController.searchByTitle));

/**
 * @route   GET /api/cards/filter/labels/:labelId
 * @desc    Filter cards by label
 * @params  {labelId: string}
 * @query   {boardId?: string}
 * @returns {cards[]}
 */
router.get('/cards/filter/labels/:labelId', asyncHandler(cardSearchController.filterByLabel));

/**
 * @route   GET /api/cards/filter/members/:memberName
 * @desc    Filter cards by assigned member
 * @params  {memberName: string}
 * @query   {boardId?: string}
 * @returns {cards[]}
 */
router.get('/cards/filter/members/:memberName', asyncHandler(cardSearchController.filterByMember));

/**
 * @route   GET /api/cards/filter/duedate
 * @desc    Filter cards by due date range
 * @query   {dueDateStart?: date, dueDateEnd?: date, boardId?: string}
 * @returns {cards[]}
 */
router.get('/cards/filter/duedate', asyncHandler(cardSearchController.filterByDueDate));

/**
 * @route   GET /api/cards/filter/no-duedate
 * @desc    Filter cards without due date
 * @query   {boardId?: string}
 * @returns {cards[]}
 */
router.get('/cards/filter/no-duedate', asyncHandler(cardSearchController.filterWithoutDueDate));

/**
 * @route   GET /api/cards/filter/checklist
 * @desc    Filter cards by checklist completion status
 * @query   {completed?: boolean, boardId?: string}
 * @returns {cards[]}
 */
router.get('/cards/filter/checklist', asyncHandler(cardSearchController.filterByChecklistCompletion));

module.exports = router;