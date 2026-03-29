// Card Search & Filter Controller
const cardSearchService = require('../services/cardSearchService');

/**
 * Search and filter cards with multiple criteria
 * GET /api/search/boards/:boardId?q=title&labelIds=id1,id2&memberNames=name1&dueDateStart=date&dueDateEnd=date
 */
const searchAndFilterCards = async (req, res) => {
  try{
    // boardId now correctly comes from route params
    const { boardId } = req.params;
    const { q, labelIds, memberNames, dueDateStart, dueDateEnd } = req.query;

    const parsedLabelIds = labelIds
      ? (Array.isArray(labelIds) ? labelIds : labelIds.split(',').filter(Boolean))
      : [];

    const parsedMemberNames = memberNames
      ? (Array.isArray(memberNames) ? memberNames : memberNames.split(',').filter(Boolean))
      : [];

    const filters = {
      q,
      labelIds: parsedLabelIds,
      memberNames: parsedMemberNames.map((name) => decodeURIComponent(name)),
      dueDateStart,
      dueDateEnd,
    };

    const cards = await cardSearchService.searchAndFilterCards(boardId, filters);

    res.status(200).json({
      success: true,
      data: cards,
      count: cards.length,
      message: 'Cards searched and filtered successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Search cards by title
 * GET /api/search/cards?q=query&boardId=optional
 */
const searchByTitle = async (req, res) => {
  try{
    const { q, boardId } = req.query;
    const { listId } = req.params;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Search query (q) is required',
      });
    }

    const cards = await cardSearchService.searchCardsByTitle(q, boardId || null, listId || null);

    res.status(200).json({
      success: true,
      data: cards,
      count: cards.length,
      message: 'Cards found by title search',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Filter cards by label
 * GET /api/search/filter/labels/:labelId?boardId=optional
 */
const filterByLabel = async (req, res) => {
  try{
    const { labelId } = req.params;
    const { boardId } = req.query;

    const cards = await cardSearchService.filterCardsByLabel(labelId, boardId || null);

    res.status(200).json({
      success: true,
      data: cards,
      count: cards.length,
      message: 'Cards filtered by label successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Filter cards by member assignment
 * GET /api/search/filter/members/:memberName?boardId=optional
 */
const filterByMember = async (req, res) => {
  try{
    const { memberName } = req.params;
    const { boardId } = req.query;

    const cards = await cardSearchService.filterCardsByMember(
      decodeURIComponent(memberName),
      boardId || null
    );

    res.status(200).json({
      success: true,
      data: cards,
      count: cards.length,
      message: 'Cards filtered by member successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Filter cards by due date range
 * GET /api/search/filter/duedate?dueDateStart=date&dueDateEnd=date&boardId=optional
 */
const filterByDueDate = async (req, res) => {
  try{
    const { dueDateStart, dueDateEnd, boardId } = req.query;

    if (!dueDateStart && !dueDateEnd) {
      return res.status(400).json({
        success: false,
        message: 'At least one due date filter is required',
      });
    }

    const cards = await cardSearchService.filterCardsByDueDate(
      dueDateStart,
      dueDateEnd,
      boardId || null
    );

    res.status(200).json({
      success: true,
      data: cards,
      count: cards.length,
      message: 'Cards filtered by due date successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Filter cards without due date
 * GET /api/search/filter/no-duedate?boardId=optional
 */
const filterWithoutDueDate = async (req, res) => {
  try{
    const { boardId } = req.query;

    const cards = await cardSearchService.filterCardsWithoutDueDate(boardId || null);

    res.status(200).json({
      success: true,
      data: cards,
      count: cards.length,
      message: 'Cards without due date retrieved successfully',
    });
  } catch(error){
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Filter cards by checklist completion
 * GET /api/search/filter/checklist?completed=true&boardId=optional
 */
const filterByChecklistCompletion = async (req, res) => {
  const { completed, boardId } = req.query;
  const includeCompleted = completed === 'true';

  const cards = await cardSearchService.filterCardsByChecklistCompletion(
    boardId || null,
    includeCompleted
  );

  res.status(200).json({
    success: true,
    data: cards,
    count: cards.length,
    message: `Cards with ${includeCompleted ? 'completed' : 'incomplete'} checklist items retrieved successfully`,
  });
};

/**
 * Get search statistics
 * GET /api/search/stats
*/
const getSearchStatistics = async (req, res) => {
  const stats = await cardSearchService.getSearchStatistics();

  res.status(200).json({
    success: true,
    data: stats,
    message: 'Search statistics retrieved successfully',
  });
};

module.exports = {
  searchAndFilterCards,
  searchByTitle,
  filterByLabel,
  filterByMember,
  filterByDueDate,
  filterWithoutDueDate,
  filterByChecklistCompletion,
  getSearchStatistics,
};