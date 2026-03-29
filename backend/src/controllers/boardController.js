// Board Controller - Handles HTTP requests for boards

const boardService = require('../services/boardService');

/**
 * Create a new board
 * POST /api/boards
 */
const createBoard = async (req, res) => {
  try{
    const { title } = req.body;

    if (!title) {     //added through chatgpt
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const board = await boardService.createBoard(title);

    res.status(201).json({
      success: true,
      data: board,
      message: 'Board created successfully',
    });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
  }
};  

/**
 * Get all boards
 * GET /api/boards
 */
const getAllBoards = async (req, res) => {
  try{
    const boards = await boardService.getAllBoards();

    res.status(200).json({
      success: true,
      data: boards,
      count: boards.length,
      message: 'Boards retrieved successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message }); 
  }
};

/**
 * Get a board by ID with all lists and cards
 * GET /api/boards/:boardId
 */
const getBoardById = async (req, res) => {
  try{
    const { boardId } = req.params;

    const board = await boardService.getBoardById(boardId);

    res.status(200).json({
      success: true,
      data: board,
      message: 'Board retrieved successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update a board
 * PATCH /api/boards/:boardId
 */
const updateBoard = async (req, res) => {
  try{
    const { boardId } = req.params;
    const updates = req.body;

    const board = await boardService.updateBoard(boardId, updates);

    res.status(200).json({
      success: true,
      data: board,
      message: 'Board updated successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a board
 * DELETE /api/boards/:boardId
 */
const deleteBoard = async (req, res) => {
  try{
    const { boardId } = req.params;

    const result = await boardService.deleteBoard(boardId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Board deleted successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBoard,
  getAllBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
};
