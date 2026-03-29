// Label Controller - Handles HTTP requests for labels

const labelService = require('../services/labelService');

/**
 * Create a new label
 * POST /api/labels
 */
const createLabel = async (req, res) => {
  const { name, color } = req.body;

  const label = await labelService.createLabel(name, color);

  res.status(201).json({
    success: true,
    data: label,
    message: 'Label created successfully',
  });
};

/**
 * Get all labels
 * GET /api/labels
 */
const getAllLabels = async (req, res) => {
  const labels = await labelService.getAllLabels();

  res.status(200).json({
    success: true,
    data: labels,
    count: labels.length,
    message: 'Labels retrieved successfully',
  });
};

/**
 * Get a label by ID
 * GET /api/labels/:labelId
 */
const getLabelById = async (req, res) => {
  const { labelId } = req.params;

  const label = await labelService.getLabelById(labelId);

  res.status(200).json({
    success: true,
    data: label,
    message: 'Label retrieved successfully',
  });
};

/**
 * Update a label
 * PATCH /api/labels/:labelId
 */
const updateLabel = async (req, res) => {
  const { labelId } = req.params;
  const updates = req.body;

  const label = await labelService.updateLabel(labelId, updates);

  res.status(200).json({
    success: true,
    data: label,
    message: 'Label updated successfully',
  });
};

/**
 * Delete a label
 * DELETE /api/labels/:labelId
 */
const deleteLabel = async (req, res) => {
  const { labelId } = req.params;

  const result = await labelService.deleteLabel(labelId);

  res.status(200).json({
    success: true,
    data: result,
    message: 'Label deleted successfully',
  });
};

/**
 * Add label to card
 * POST /api/cards/:cardId/labels
 */
const addLabelToCard = async (req, res) => {
  const { cardId } = req.params;
  const { labelId } = req.body;

  const card = await labelService.addLabelToCard(cardId, labelId);

  res.status(200).json({
    success: true,
    data: card,
    message: 'Label added to card successfully',
  });
};

/**
 * Remove label from card
 * DELETE /api/cards/:cardId/labels/:labelId
 */
const removeLabelFromCard = async (req, res) => {
  const { cardId, labelId } = req.params;

  const card = await labelService.removeLabelFromCard(cardId, labelId);

  res.status(200).json({
    success: true,
    data: card,
    message: 'Label removed from card successfully',
  });
};

module.exports = {
  createLabel,
  getAllLabels,
  getLabelById,
  updateLabel,
  deleteLabel,
  addLabelToCard,
  removeLabelFromCard,
};
