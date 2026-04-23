'use client';
import { useEffect } from 'react';
import { useBoardStore } from '../store/boardStore';
import Board from '../components/Board';
import Header from '../components/Header';
import BoardDock from '../components/Boarddock';

// Map board background colors to nicer gradient styles used in the page background.
const GRADIENT_MAP: Record<string, string> = {
  '#0079bf': 'linear-gradient(135deg, #1a6496 0%, #0e4d72 40%, #083a57 100%)',
  '#d29034': 'linear-gradient(135deg, #b8791f 0%, #8a5a14 100%)',
  '#519839': 'linear-gradient(135deg, #3a7427 0%, #255119 100%)',
  '#b04632': 'linear-gradient(135deg, #922e1e 0%, #6b1e12 100%)',
  '#89609e': 'linear-gradient(135deg, #6b4580 0%, #4a2d5c 100%)',
  '#cd5a91': 'linear-gradient(135deg, #a83d74 0%, #7d2654 100%)',
  '#4bbf6b': 'linear-gradient(135deg, #2ea050 0%, #1d7536 100%)',
  '#00aecc': 'linear-gradient(135deg, #0090aa 0%, #006980 100%)',
  '#838c91': 'linear-gradient(135deg, #606970 0%, #414b50 100%)',
};

const DEFAULT_BG = 'linear-gradient(135deg, #1a2a3a 0%, #0f1923 60%, #0a1218 100%)';

// Home page component: loads board data and shows the current board or welcome screen.
export default function Home() {
  const { currentBoardId, boards, fetchBoards, fetchLabels, loading } = useBoardStore();

  useEffect(() => {
    fetchBoards();
    fetchLabels();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Find the board object that is currently selected.
  const currentBoard = Array.isArray(boards)
    ? boards.find((b) => b.id === currentBoardId)
    : undefined;

  // Choose a background gradient for the selected board or fallback to a default.
  const bg = currentBoard?.background
    ? (GRADIENT_MAP[currentBoard.background] ?? `linear-gradient(135deg, ${currentBoard.background}cc 0%, ${currentBoard.background}88 100%)`)
    : DEFAULT_BG;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: DEFAULT_BG }}>
        <div className="text-white/80 text-lg font-medium">Loading…</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: bg }}
    >
      <Header currentBoard={currentBoard} />

      {/* pb-20 gives clearance so the dock doesn't cover the last list row */}
      <div className="flex-1 flex flex-col pb-20">
        {currentBoard ? (
          <Board board={currentBoard} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-5 select-none">📋</div>
              <h2 className="text-2xl font-bold mb-2 text-white/90">Welcome to Trello Clone</h2>
              <p className="text-white/50">Create a board using the button above to get started.</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating bottom dock — always visible */}
      <BoardDock />
    </div>
  );
}
