// Card Routes
const express = require('express');
const cardController = require('../controllers/cardController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router({ mergeParams: true });

/**
 * @route   POST /api/lists/:listId/cards
 * @desc    Create a new card in a list
 */
router.post('/', asyncHandler(cardController.createCard));

/**
 * @route   GET /api/lists/:listId/cards
 * @desc    Get all cards for a list
 */
router.get('/', asyncHandler(cardController.getCardsByListId));

/**
 * @route   PATCH /api/lists/:listId/cards/reorder
 * @desc    Reorder cards (within or across lists)
 * @body    {cards: Array<{id: string, listId: string, order: number}>}
 *
 * IMPORTANT: Must be defined BEFORE /:cardId so Express does not treat
 * the literal string "reorder" as a cardId parameter.
 */
router.patch('/reorder', asyncHandler(cardController.reorderCards));

/**
 * @route   GET /api/cards/:cardId
 * @desc    Get a card by ID
 */
router.get('/:cardId', asyncHandler(cardController.getCardById));

/**
 * @route   PATCH /api/cards/:cardId
 * @desc    Update a card
 */
router.patch('/:cardId', asyncHandler(cardController.updateCard));

/**
 * @route   POST /api/cards/:cardId/move
 * @desc    Move card to another list
 * @body    {toListId: string, newOrder: number}
 */
router.post('/:cardId/move', asyncHandler(cardController.moveCardToList));

/**
 * @route   DELETE /api/cards/:cardId
 * @desc    Delete a card
 */
router.delete('/:cardId', asyncHandler(cardController.deleteCard));

/**
 * @route   PATCH /api/cards/:cardId/archive
 * @desc    Archive a card
 */
router.patch('/:cardId/archive', asyncHandler(cardController.archiveCard));

/**
 * @route   PATCH /api/cards/:cardId/unarchive
 * @desc    Unarchive a card
 */
router.patch('/:cardId/unarchive', asyncHandler(cardController.unarchiveCard));

/**
 * @route   POST /api/cards/:cardId/members
 * @desc    Add member to card
 * @body    {memberName: string}
 */
router.post('/:cardId/members', asyncHandler(cardController.addMember));

/**
 * @route   DELETE /api/cards/:cardId/members/:memberName
 * @desc    Remove member from card
 */
router.delete('/:cardId/members/:memberName', asyncHandler(cardController.removeMember));

/**
 * @route   POST /api/cards/:cardId/labels
 * @desc    Add label to card
 * @body    {labelId: string}
 */
router.post('/:cardId/labels', asyncHandler(cardController.addLabelToCard));

/**
 * @route   DELETE /api/cards/:cardId/labels/:labelId
 * @desc    Remove label from card
 */
router.delete('/:cardId/labels/:labelId', asyncHandler(cardController.removeLabelFromCard));

module.exports = router;