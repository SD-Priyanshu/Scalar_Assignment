// Card Controller - Handles HTTP requests for cards

const cardService = require('../services/cardService');
const labelService = require('../services/labelService');

/**
 * Create a new card in a list
 * POST /api/lists/:listId/cards
 */
const createCard = async (req, res) => {
  try{
    const { listId } = req.params;
    const { title, description, dueDate, cover } = req.body;

    const card = await cardService.createCard(listId, title, {
      description,
      dueDate,
      cover,
    });

    res.status(201).json({
      success: true,
      data: card,
      message: 'Card created successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all cards for a list
 * GET /api/lists/:listId/cards
 */
const getCardsByListId = async (req, res) => {
  try{
    const { listId } = req.params;

    const cards = await cardService.getCardsByListId(listId);

    res.status(200).json({
      success: true,
      data: cards,
      count: cards.length,
      message: 'Cards retrieved successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get a card by ID
 * GET /api/cards/:cardId
 */
const getCardById = async (req, res) => {
  try{
    const { cardId } = req.params;

    const card = await cardService.getCardById(cardId);

    if (!card) {
      return res.status(404).json({ success: false, message: "Card not found" });
    }

    res.status(200).json({
      success: true,
      data: card,
      message: 'Card retrieved successfully',
    });
  } catch (error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update a card
 * PATCH /api/cards/:cardId
 */
const updateCard = async (req, res) => {
  try{
    const { cardId } = req.params;
    const updates = req.body;

    const card = await cardService.updateCard(cardId, updates);

    res.status(200).json({
      success: true,
      data: card,
      message: 'Card updated successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Move card to another list
 * POST /api/cards/:cardId/move
 */
const moveCardToList = async (req, res) => {
  try{
    const { cardId } = req.params;
    const { toListId, newOrder } = req.body;

    if (!toListId) {
      return res.status(400).json({ success: false, message: "Target list required" });
    }

    const card = await cardService.moveCardToList(cardId, toListId, newOrder);

    res.status(200).json({
      success: true,
      data: card,
      message: 'Card moved successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Reorder cards
 * PATCH /api/lists/:listId/cards/reorder
 */
const reorderCards = async (req, res) => {
  try{
    const { cards } = req.body;

    const updatedCards = await cardService.reorderCards(cards);

    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({ success: false, message: "Invalid cards data" });
    }

    res.status(200).json({
      success: true,
      data: updatedCards,
      message: 'Cards reordered successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a card
 * DELETE /api/cards/:cardId
 */
const deleteCard = async (req, res) => {
  try{
    const { cardId } = req.params;

    const result = await cardService.deleteCard(cardId);

    if (!result) {
      return res.status(404).json({ success: false, message: "Card not found" });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: 'Card deleted successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Archive a card
 * PATCH /api/cards/:cardId/archive
 */
const archiveCard = async (req, res) => {
  try{
    const { cardId } = req.params;

    const card = await cardService.archiveCard(cardId);

    res.status(200).json({
      success: true,
      data: card,
      message: 'Card archived successfully',
    });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Unarchive a card
 * PATCH /api/cards/:cardId/unarchive
 */
const unarchiveCard = async (req, res) => {
  try{
    const { cardId } = req.params;

    const card = await cardService.unarchiveCard(cardId);

    res.status(200).json({
      success: true,
      data: card,
      message: 'Card unarchived successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add member to card
 * POST /api/cards/:cardId/members
 */
const addMember = async (req, res) => {
  try{
    const { cardId } = req.params;
    const { memberName } = req.body;

    if (!memberName) {
      return res.status(400).json({ success: false, message: "Member name required" });
    }

    const card = await cardService.addMember(cardId, memberName);

    res.status(200).json({
      success: true,
      data: card,
      message: 'Member added successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Remove member from card
 * DELETE /api/cards/:cardId/members/:memberName
 */
const removeMember = async (req, res) => {
  try{
    const { cardId, memberName } = req.params;

    if (!memberName) {
      return res.status(404).json({ success: false, message: "Member Not Found" });
    }

    const card = await cardService.removeMember(cardId, decodeURIComponent(memberName));

    res.status(200).json({
      success: true,
      data: card,
      message: 'Member removed successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add label to card
 * POST /api/cards/:cardId/labels
 */
const addLabelToCard = async (req, res) => {
  try{
    const { cardId } = req.params;
    const { labelId } = req.body;

    if (!labelId) {
      return res.status(400).json({ success: false, message: "Label ID required" });
    }

    const card = await labelService.addLabelToCard(cardId, labelId);

    res.status(200).json({
      success: true,
      data: card,
      message: 'Label added to card successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Remove label from card
 * DELETE /api/cards/:cardId/labels/:labelId
 */
const removeLabelFromCard = async (req, res) => {
  try{
    const { cardId, labelId } = req.params;

    if (!labelId) {
      return res.status(404).json({ success: false, message: "Label Not Found" });
    }

    const card = await labelService.removeLabelFromCard(cardId, labelId);

    res.status(200).json({
      success: true,
      data: card,
      message: 'Label removed from card successfully',
    });
  }catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCard,
  getCardsByListId,
  getCardById,
  updateCard,
  moveCardToList,
  reorderCards,
  deleteCard,
  archiveCard,
  unarchiveCard,
  addMember,
  removeMember,
  addLabelToCard,
  removeLabelFromCard,
};
