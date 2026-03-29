// List Controller - Handles HTTP requests for lists

const listService = require('../services/listService');

/**
 * Create a new list in a board
 * POST /api/boards/:boardId/lists
 */
const createList = async (req, res) => {
  const { boardId } = req.params;
  const { title } = req.body;

  const list = await listService.createList(boardId, title);

  res.status(201).json({
    success: true,
    data: list,
    message: 'List created successfully',
  });
};

/**
 * Get all lists for a board
 * GET /api/boards/:boardId/lists
 */
const getListsByBoardId = async (req, res) => {
  const { boardId } = req.params;

  const lists = await listService.getListsByBoardId(boardId);

  res.status(200).json({
    success: true,
    data: lists,
    count: lists.length,
    message: 'Lists retrieved successfully',
  });
};

/**
 * Get a list by ID
 * GET /api/lists/:listId
 */
const getListById = async (req, res) => {
  const { listId } = req.params;

  const list = await listService.getListById(listId);

  res.status(200).json({
    success: true,
    data: list,
    message: 'List retrieved successfully',
  });
};

/**
 * Update a list (title and/or order)
 * PATCH /api/lists/:listId
 */
const updateList = async (req, res) => {
  const { listId } = req.params;
  const updates = req.body;

  const list = await listService.updateList(listId, updates);

  res.status(200).json({
    success: true,
    data: list,
    message: 'List updated successfully',
  });
};

/**
 * Archive a list
 * PATCH /api/lists/:listId/archive
 */
const archiveList = async (req, res) => {
  const { listId } = req.params;

  const list = await listService.archiveList(listId);

  res.status(200).json({
    success: true,
    data: list,
    message: 'List archived successfully',
  });
};

/**
 * Reorder lists (drag and drop)
 * PATCH /api/boards/:boardId/lists/reorder
 */
const reorderLists = async (req, res) => {
  const { boardId } = req.params;
  const { lists } = req.body;

  const updatedLists = await listService.reorderLists(boardId, lists);

  res.status(200).json({
    success: true,
    data: updatedLists,
    message: 'Lists reordered successfully',
  });
};

/**
 * Delete a list
 * DELETE /api/lists/:listId
 */
const deleteList = async (req, res) => {
  const { listId } = req.params;

  const result = await listService.deleteList(listId);

  res.status(200).json({
    success: true,
    data: result,
    message: 'List deleted successfully',
  });
};

module.exports = {
  createList,
  getListsByBoardId,
  getListById,
  updateList,
  reorderLists,
  deleteList,
};
