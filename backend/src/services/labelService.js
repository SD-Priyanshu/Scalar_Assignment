// Label Service - Business logic for label operations

const prisma = require('../utils/db');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');
const { validateString, validateId } = require('../utils/validation');

/**
 * Create a new label
 * @param {string} name - Label name
 * @param {string} color - Label color (hex or color name)
 * @returns {Promise<Object>} Created label object
 */
const createLabel = async (name, color) => {
  const validatedName = validateString(name, 'Label name', {
    minLength: 1,
    maxLength: 50,
  });
  
  const validatedColor = validateString(color, 'Label color', {
    minLength: 1,
    maxLength: 20,
  });

  const label = await prisma.label.create({
    data: {
      name: validatedName,
      color: validatedColor,
    },
  });

  return label;
};

/**
 * Get all labels
 * @returns {Promise<Array>} Array of label objects
 */
const getAllLabels = async () => {
  const labels = await prisma.label.findMany({
    orderBy: { name: 'asc' },
  });

  return labels;
};

/**
 * Get a label by ID
 * @param {string} labelId - Label ID
 * @returns {Promise<Object>} Label object
 */
const getLabelById = async (labelId) => {
  const validatedId = validateId(labelId, 'Label ID');

  const label = await prisma.label.findUnique({
    where: { id: validatedId },
  });

  if (!label) {
    throw new NotFoundError(`Label with ID "${validatedId}" not found`);
  }

  return label;
};

/**
 * Update a label
 * @param {string} labelId - Label ID
 * @param {Object} updates - Fields to update {name?, color?}
 * @returns {Promise<Object>} Updated label object
 */
const updateLabel = async (labelId, updates) => {
  const validatedId = validateId(labelId, 'Label ID');

  const validatedUpdates = {};
  if (updates.name !== undefined) {
    validatedUpdates.name = validateString(updates.name, 'Label name', {
      minLength: 1,
      maxLength: 50,
    });
  }
  if (updates.color !== undefined) {
    validatedUpdates.color = validateString(updates.color, 'Label color', {
      minLength: 1,
      maxLength: 20,
    });
  }

  // Verify label exists
  const existingLabel = await prisma.label.findUnique({
    where: { id: validatedId },
  });

  if (!existingLabel) {
    throw new NotFoundError(`Label with ID "${validatedId}" not found`);
  }

  const label = await prisma.label.update({
    where: { id: validatedId },
    data: validatedUpdates,
  });

  return label;
};

/**
 * Delete a label
 * @param {string} labelId - Label ID
 * @returns {Promise<Object>} Success message
 */
const deleteLabel = async (labelId) => {
  const validatedId = validateId(labelId, 'Label ID');

  const label = await prisma.label.findUnique({
    where: { id: validatedId },
  });

  if (!label) {
    throw new NotFoundError(`Label with ID "${validatedId}" not found`);
  }

  // Delete the label (card associations will cascade delete)
  await prisma.label.delete({
    where: { id: validatedId },
  });

  return { success: true, message: 'Label deleted successfully' };
};

/**
 * Add label to card
 * @param {string} cardId - Card ID
 * @param {string} labelId - Label ID
 * @returns {Promise<Object>} Card with updated labels
 */
const addLabelToCard = async (cardId, labelId) => {
  const validatedCardId = validateId(cardId, 'Card ID');
  const validatedLabelId = validateId(labelId, 'Label ID');

  // Verify card exists
  const card = await prisma.card.findUnique({
    where: { id: validatedCardId },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedCardId}" not found`);
  }

  // Verify label exists
  const label = await prisma.label.findUnique({
    where: { id: validatedLabelId },
  });

  if (!label) {
    throw new NotFoundError(`Label with ID "${validatedLabelId}" not found`);
  }

  // Check if label already on card
  const existingCardLabel = await prisma.cardLabel.findUnique({
    where: {
      cardId_labelId: {
        cardId: validatedCardId,
        labelId: validatedLabelId,
      },
    },
  });

  if (existingCardLabel) {
    throw new ConflictError('Label is already assigned to this card');
  }

  // Add label to card
  await prisma.cardLabel.create({
    data: {
      cardId: validatedCardId,
      labelId: validatedLabelId,
    },
  });

  // Return updated card
  const updatedCard = await prisma.card.findUnique({
    where: { id: validatedCardId },
    include: {
      labels: {
        include: {
          label: true,
        },
      },
      checklist: true,
      comments: true,
    },
  });

  return updatedCard;
};

/**
 * Remove label from card
 * @param {string} cardId - Card ID
 * @param {string} labelId - Label ID
 * @returns {Promise<Object>} Card with updated labels
 */
const removeLabelFromCard = async (cardId, labelId) => {
  const validatedCardId = validateId(cardId, 'Card ID');
  const validatedLabelId = validateId(labelId, 'Label ID');

  // Verify card exists
  const card = await prisma.card.findUnique({
    where: { id: validatedCardId },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedCardId}" not found`);
  }

  // Delete label association
  await prisma.cardLabel.delete({
    where: {
      cardId_labelId: {
        cardId: validatedCardId,
        labelId: validatedLabelId,
      },
    },
  });

  // Return updated card
  const updatedCard = await prisma.card.findUnique({
    where: { id: validatedCardId },
    include: {
      labels: {
        include: {
          label: true,
        },
      },
      checklist: true,
      comments: true,
    },
  });

  return updatedCard;
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
