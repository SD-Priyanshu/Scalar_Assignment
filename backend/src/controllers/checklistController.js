// Checklist Item Controller - Handles HTTP requests for checklist items

const checklistService = require('../services/checklistService');

/**
 * Create a checklist item
 * POST /api/cards/:cardId/checklist
 */
const createChecklistItem = async (req, res) => {
  try{
    const { cardId } = req.params;
    const { text } = req.body;  

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Checklist text is required',
      });
    }

    const item = await checklistService.createChecklistItem(cardId, text);

    res.status(201).json({
      success: true,
      data: item,
      message: 'Checklist item created successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all checklist items for a card
 * GET /api/cards/:cardId/checklist
 */
const getChecklistItemsByCardId = async (req, res) => {
  try{
    const { cardId } = req.params;

    const items = await checklistService.getChecklistItemsByCardId(cardId);

    res.status(200).json({
      success: true,
      data: items,
      count: items.length,
      message: 'Checklist items retrieved successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get a checklist item by ID
 * GET /api/checklist/:itemId
 */
const getChecklistItemById = async (req, res) => {
  try{
    const { itemId } = req.params;

    const item = await checklistService.getChecklistItemById(itemId);

    res.status(200).json({
      success: true,
      data: item,
      message: 'Checklist item retrieved successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update a checklist item
 * PATCH /api/checklist/:itemId
 */
const updateChecklistItem = async (req, res) => {
  try{
    const { itemId } = req.params;
    const { text, done } = req.body;

    const item = await checklistService.updateChecklistItem(itemId, text, done);

    res.status(200).json({
      success: true,
      data: item,
      message: 'Checklist item updated successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a checklist item
 * DELETE /api/checklist/:itemId
 */
const deleteChecklistItem = async (req, res) => {
  try{
    const { itemId } = req.params;

    const result = await checklistService.deleteChecklistItem(itemId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Checklist item deleted successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get checklist progress for a card
 * GET /api/cards/:cardId/checklist/progress
 */
const getChecklistProgress = async (req, res) => {
  try{
    const { cardId } = req.params;

    const progress = await checklistService.getChecklistProgress(cardId);

    res.status(200).json({
      success: true,
      data: progress,
      message: 'Checklist progress retrieved successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createChecklistItem,
  getChecklistItemsByCardId,
  getChecklistItemById,
  updateChecklistItem,
  deleteChecklistItem,
  getChecklistProgress,
};
