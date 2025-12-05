import React, { useState, useEffect } from 'react';

export default function MiniGame() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    // Game logic: Increase complexity as level increases
    const interval = setInterval(() => {
      if (!isGameOver) {
        setScore((prev) => prev + level);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [level, isGameOver]);

  const handleLevelUp = () => {
    setLevel((prev) => prev + 1);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
  };

  return (
    <div className="minigame-container" style={{ width: '100vw', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <h1>Mini Game</h1>
      <p>Score: {score}</p>
      <p>Level: {level}</p>
      <button onClick={handleLevelUp} disabled={isGameOver}>Level Up</button>
      <button onClick={handleGameOver}>End Game</button>
      {isGameOver && <p>Game Over! Final Score: {score}</p>}
    </div>
  );
}