"use client";
import React, { useEffect, useRef, useState } from "react";

interface Position { x: number; y: number; }

export default function SnakeGame({ onBack }: { onBack: () => void }) {
  // --- Configurações ---
  const GRID = 20; // células por linha/coluna
  const DEFAULT_INTERVAL_MS = 100; // tempo entre passos (menor = mais rápido / mais fluido)
  // --- Estados ---
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">("RIGHT");
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [moveIntervalMs, setMoveIntervalMs] = useState<number>(DEFAULT_INTERVAL_MS);
  const [cellSize, setCellSize] = useState<number>(20); // px, calculado à medida que o container monta
  const gameAreaRef = useRef<HTMLDivElement | null>(null);

  // refs para uso dentro do loop (evita stale closures)
  const dirRef = useRef(direction);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food); // REF adicionada para food
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accRef = useRef(0);

  // Manter refs sincronizadas
  useEffect(() => { dirRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]); // SINCRONIZAR foodRef

  // Define tamanho da célula com base no tamanho do container (responsivo)
  useEffect(() => {
    const calc = () => {
      const el = gameAreaRef.current;
      if (!el) return;
      const px = Math.floor(Math.min(window.innerWidth * 0.92, 420)); // largura desejada (máx 420)
      el.style.width = `${px}px`;
      el.style.height = `${px}px`;
      setCellSize(Math.floor(px / GRID));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // Gera uma posição de comida que não colida com a cobra
  const placeFood = () => {
    let pos: Position;
    const occupied = (p: Position) => snakeRef.current.some(s => s.x === p.x && s.y === p.y);
    do {
      pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (occupied(pos));
    setFood(pos);
  };

  // Reiniciar jogo
  const restart = () => {
    setSnake([{ x: Math.floor(GRID / 2), y: Math.floor(GRID / 2) }]);
    setDirection("RIGHT");
    dirRef.current = "RIGHT";
    setScore(0);
    setGameOver(false);
    placeFood();
    lastTimeRef.current = null;
    accRef.current = 0;
  };

  // Movimento: função usada dentro do RAF loop
  const step = () => {
    setSnake(prev => {
      const head = { ...prev[0] };
      const d = dirRef.current;
      if (d === "UP") head.y -= 1;
      if (d === "DOWN") head.y += 1;
      if (d === "LEFT") head.x -= 1;
      if (d === "RIGHT") head.x += 1;

      // colisão com parede -> morrer
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        setGameOver(true);
        return prev;
      }

      // colisão com corpo
      if (prev.some((s, i) => i !== 0 && s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        return prev;
      }

      // Usar foodRef.current em vez de food para evitar stale closure
      const ate = head.x === foodRef.current.x && head.y === foodRef.current.y;
      const newSnake = [head, ...prev];

      if (!ate) {
        newSnake.pop();
      } else {
        setScore(s => s + 10);
        placeFood(); // Gerar nova comida
      }

      return newSnake;
    });
  };

  // Loop principal usando requestAnimationFrame (mais fluido)
  useEffect(() => {
    if (gameOver) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const loop = (time: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;
      accRef.current += dt;

      while (accRef.current >= moveIntervalMs) {
        // avançar um passo por cada intervalo acumulado
        step();
        accRef.current -= moveIntervalMs;
        // se morreu dentro do step, pare de processar mais passos
        if (gameOver) break;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveIntervalMs, gameOver]); // depend apenas da velocidade e do estado de fim

  // Controles por teclado (desktop)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === "ArrowUp" && dirRef.current !== "DOWN") { setDirection("UP"); dirRef.current = "UP"; }
      if (e.key === "ArrowDown" && dirRef.current !== "UP") { setDirection("DOWN"); dirRef.current = "DOWN"; }
      if (e.key === "ArrowLeft" && dirRef.current !== "RIGHT") { setDirection("LEFT"); dirRef.current = "LEFT"; }
      if (e.key === "ArrowRight" && dirRef.current !== "LEFT") { setDirection("RIGHT"); dirRef.current = "RIGHT"; }
      // espaço para reiniciar se gameOver
      if (e.key === " " && gameOver) restart();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameOver]);

  // Swipe touch detection (mobile)
  useEffect(() => {
    const el = gameAreaRef.current;
    if (!el) return;
    let startX = 0, startY = 0, moving = false;

    const onTouchStart = (ev: TouchEvent) => {
      if (gameOver) return;
      const t = ev.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      moving = true;
    };
    const onTouchMove = (ev: TouchEvent) => {
      if (!moving) return;
      const t = ev.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      // detectar direção quando passar de 20px
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        moving = false;
        if (Math.abs(dx) > Math.abs(dy)) {
          // horizontal
          if (dx > 0 && dirRef.current !== "LEFT") { setDirection("RIGHT"); dirRef.current = "RIGHT"; }
          else if (dx < 0 && dirRef.current !== "RIGHT") { setDirection("LEFT"); dirRef.current = "LEFT"; }
        } else {
          // vertical
          if (dy > 0 && dirRef.current !== "UP") { setDirection("DOWN"); dirRef.current = "DOWN"; }
          else if (dy < 0 && dirRef.current !== "DOWN") { setDirection("UP"); dirRef.current = "UP"; }
        }
      }
    };
    const onTouchEnd = () => { moving = false; };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart as any);
      el.removeEventListener("touchmove", onTouchMove as any);
      el.removeEventListener("touchend", onTouchEnd as any);
    };
  }, [gameOver]);

  // Inicializa comida na montagem
  useEffect(() => { placeFood(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // --- Render ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-start gap-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <header className="w-full max-w-md flex items-center justify-between">
        <button onClick={onBack} className="px-3 py-1 bg-slate-700 rounded-md">← Voltar</button>
        <div className="text-center">
          <h1 className="text-lg font-bold">Snake Moderno</h1>
          <div className="text-sm text-slate-300">Pontuação: <span className="font-bold text-yellow-300">{score}</span></div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setMoveIntervalMs(ms => Math.max(40, ms - 10)); }} title="Aumentar velocidade" className="px-2 py-1 bg-slate-700 rounded">+</button>
          <button onClick={() => { setMoveIntervalMs(ms => Math.min(400, ms + 10)); }} title="Diminuir velocidade" className="px-2 py-1 bg-slate-700 rounded">−</button>
        </div>
      </header>

      <main className="w-full max-w-md flex flex-col items-center gap-3">
        {/* Área do jogo (quadrada e responsiva) */}
        <div
          ref={gameAreaRef}
          className="relative bg-black rounded-lg shadow-2xl overflow-hidden"
          style={{
            width: `${cellSize * GRID}px`,
            height: `${cellSize * GRID}px`,
            boxShadow: `0 8px 30px rgba(0,0,0,0.6), inset 0 0 60px rgba(255,255,255,0.02)`,
            backgroundImage: `linear-gradient(0deg, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: `${cellSize}px ${cellSize}px, ${cellSize}px ${cellSize}px`
          }}
        >
          {/* Comida */}
          <div
            style={{
              position: "absolute",
              left: food.x * cellSize,
              top: food.y * cellSize,
              width: cellSize,
              height: cellSize,
              borderRadius: Math.max(4, cellSize * 0.25),
              background: "radial-gradient(circle at 35% 30%, #fff7, #ff6b6b)",
              boxShadow: `0 0 ${Math.max(6, cellSize * 0.4)}px rgba(255,107,107,0.9)`
            }}
          />

          {/* Cobra */}
          {snake.map((segment, idx) => {
            const isHead = idx === 0;
            return (
              <div
                key={`${segment.x}-${segment.y}-${idx}`}
                style={{
                  position: "absolute",
                  left: segment.x * cellSize,
                  top: segment.y * cellSize,
                  width: cellSize,
                  height: cellSize,
                  borderRadius: isHead ? Math.max(6, cellSize * 0.35) : Math.max(4, cellSize * 0.22),
                  transition: "left 80ms linear, top 80ms linear, transform 120ms",
                  transform: isHead ? "scale(1.05)" : "scale(1)",
                  background: isHead
                    ? "linear-gradient(135deg,#9cfb7a,#2ee07f)" // cabeça
                    : "linear-gradient(135deg,#42b883,#1f8a5f)",     // corpo
                  boxShadow: isHead ? `0 0 ${Math.max(8, cellSize * 0.45)}px rgba(46,224,127,0.6)` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              />
            );
          })}

          {/* overlay Game Over */}
          {gameOver && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.6))"
            }}>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-2">Fim de Jogo</h2>
                <p className="mb-3">Pontuação: <span className="font-bold">{score}</span></p>
                <div className="flex gap-2 justify-center">
                  <button onClick={restart} className="px-4 py-2 bg-green-500 rounded-md font-bold">Jogar Novamente</button>
                  <button onClick={onBack} className="px-4 py-2 bg-slate-700 rounded-md">Menu</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controles para Mobile (D-pad) */}
        <div className="mt-2 flex flex-col items-center gap-2 select-none">
          <div className="grid grid-cols-3 gap-2">
            <div />
            <button
              className="p-3 bg-slate-700 rounded-lg touch-manipulation"
              onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== "DOWN") { setDirection("UP"); dirRef.current = "UP"; } }}
              onMouseDown={() => { if (dirRef.current !== "DOWN") { setDirection("UP"); dirRef.current = "UP"; } }}
            >⬆️</button>
            <div />
            <button
              className="p-3 bg-slate-700 rounded-lg"
              onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== "RIGHT") { setDirection("LEFT"); dirRef.current = "LEFT"; } }}
              onMouseDown={() => { if (dirRef.current !== "RIGHT") { setDirection("LEFT"); dirRef.current = "LEFT"; } }}
            >⬅️</button>
            <div />
            <button
              className="p-3 bg-slate-700 rounded-lg"
              onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== "LEFT") { setDirection("RIGHT"); dirRef.current = "RIGHT"; } }}
              onMouseDown={() => { if (dirRef.current !== "LEFT") { setDirection("RIGHT"); dirRef.current = "RIGHT"; } }}
            >➡️</button>
            <div />
            <button
              className="p-3 bg-slate-700 rounded-lg"
              onTouchStart={(e) => { e.preventDefault(); if (dirRef.current !== "UP") { setDirection("DOWN"); dirRef.current = "DOWN"; } }}
              onMouseDown={() => { if (dirRef.current !== "UP") { setDirection("DOWN"); dirRef.current = "DOWN"; } }}
            >⬇️</button>
            <div />
          </div>

          <div className="flex gap-2 mt-2">
            <button onClick={() => setMoveIntervalMs(ms => Math.max(40, ms - 10))} className="px-3 py-1 bg-slate-700 rounded">Mais rápido</button>
            <button onClick={() => setMoveIntervalMs(ms => Math.min(400, ms + 10))} className="px-3 py-1 bg-slate-700 rounded">Mais lento</button>
            <button onClick={restart} className="px-3 py-1 bg-green-600 rounded">Restart</button>
          </div>
        </div>
      </main>

      <footer className="mt-4 text-xs text-slate-400">
        Toque/arraste na área do jogo ou use os botões. A cobra morre ao bater na parede ou em si mesma.
      </footer>
    </div>
  );
}