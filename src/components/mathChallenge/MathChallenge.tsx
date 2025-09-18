"use client";
import { useState, useEffect } from "react";

interface MathChallengeProps {
  onBack: () => void;
}

interface ScoreData {
  name: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  date: string;
}

export default function MathChallenge({ onBack }: MathChallengeProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [question, setQuestion] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [highScores, setHighScores] = useState<ScoreData[]>([]);
  const [playerName, setPlayerName] = useState("");

  // Operações matemáticas
  const operations = [
    { symbol: "+", name: "Adição" },
    { symbol: "-", name: "Subtração" },
    { symbol: "×", name: "Multiplicação" },
    { symbol: "÷", name: "Divisão" }
  ];

  // Carrega recordes
  useEffect(() => {
    const savedName = localStorage.getItem("mathChallengePlayerName");
    const savedScores = localStorage.getItem("mathChallengeHighScores");
    
    if (savedName) setPlayerName(savedName);
    if (savedScores) setHighScores(JSON.parse(savedScores));
  }, []);

  // Gera questão matemática
  const generateQuestion = () => {
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer, questionText;

    switch (operation.symbol) {
      case "+":
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        questionText = `${num1} + ${num2}`;
        break;
      
      case "-":
        num1 = Math.floor(Math.random() * 100) + 20;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        questionText = `${num1} - ${num2}`;
        break;
      
      case "×":
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        questionText = `${num1} × ${num2}`;
        break;
      
      case "÷":
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer;
        questionText = `${num1} ÷ ${num2}`;
        break;
      
      default:
        num1 = 0;
        num2 = 0;
        answer = 0;
        questionText = "";
    }

    setQuestion(questionText);
    setCorrectAnswer(answer);
    setUserAnswer("");
    setFeedback("");
    setTotalQuestions(prev => prev + 1);
  };

  // Inicia o jogo
  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameActive(true);
    setGameOver(false);
    setCorrectCount(0);
    setTotalQuestions(0);
    generateQuestion();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Verifica resposta
  const checkAnswer = () => {
    const userAnswerNum = parseInt(userAnswer);
    if (isNaN(userAnswerNum)) {
      setFeedback("Digite um número válido!");
      return;
    }

    if (userAnswerNum === correctAnswer) {
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
      setFeedback("✅ Correto! +10 pontos");
    } else {
      setFeedback(`❌ Errado! A resposta era ${correctAnswer}`);
    }

    setTimeout(() => {
      generateQuestion();
    }, 1000);
  };

  // Finaliza o jogo
  const endGame = () => {
    setGameActive(false);
    setGameOver(true);

    // Verifica se é recorde
    const currentBest = highScores[0];
    if (!currentBest || score > currentBest.score) {
      let name = playerName;
      if (!name) {
        name = prompt("🎉 Novo recorde! Digite seu nome:") || "Jogador";
        setPlayerName(name);
        localStorage.setItem("mathChallengePlayerName", name);
      }

      const newScore: ScoreData = {
        name,
        score,
        correctAnswers: correctCount,
        totalQuestions,
        date: new Date().toLocaleDateString('pt-BR')
      };

      const updatedScores = [newScore, ...highScores]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setHighScores(updatedScores);
      localStorage.setItem("mathChallengeHighScores", JSON.stringify(updatedScores));
    }
  };

  // Teclado rápido
  const handleNumberClick = (num: number) => {
    if (gameActive) {
      setUserAnswer(prev => prev + num.toString());
    }
  };

  const handleClear = () => {
    setUserAnswer("");
  };

  const handleBackspace = () => {
    setUserAnswer(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-amber-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-800/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-700/40">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors flex items-center"
          >
            <span className="mr-2">←</span> Voltar
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            🧮 Math Challenge
          </h1>
        </div>

        {!gameActive && !gameOver && (
          <div className="text-center py-8">
            <div className="text-lg mb-6">
              <p>Resolva o máximo de problemas matemáticos</p>
              <p>em <span className="text-yellow-400">60 segundos</span>!</p>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg transition-colors"
            >
              🚀 Começar Jogo
            </button>
          </div>
        )}

        {gameActive && (
          <>
            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-400">Tempo</div>
                <div className={`text-xl font-bold ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-blue-400"}`}>
                  {timeLeft}s
                </div>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-400">Pontos</div>
                <div className="text-xl font-bold text-yellow-400">{score}</div>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-400">Acertos</div>
                <div className="text-xl font-bold text-green-400">
                  {correctCount}/{totalQuestions}
                </div>
              </div>
            </div>

            {/* Questão */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold bg-slate-700/50 p-4 rounded-lg mb-4">
                {question} = ?
              </div>
              
              {/* Resposta */}
              <div className="mb-4">
                <div className="text-2xl font-mono bg-slate-600/50 p-3 rounded">
                  {userAnswer || "?"}
                </div>
                {feedback && (
                  <div className={`mt-2 p-2 rounded ${
                    feedback.includes("✅") ? "bg-green-900/50" : "bg-red-900/50"
                  }`}>
                    {feedback}
                  </div>
                )}
              </div>

              {/* Teclado Numérico */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleBackspace}
                  className="p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  ⌫
                </button>
                <button
                  onClick={handleClear}
                  className="p-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                >
                  C
                </button>
              </div>

              <button
                onClick={checkAnswer}
                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors"
              >
                ✅ Verificar
              </button>
            </div>
          </>
        )}

        {gameOver && (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">🎯 Fim de Jogo!</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-400">Pontuação Final</div>
                <div className="text-xl font-bold text-yellow-400">{score}</div>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="text-xs text-slate-400">Precisão</div>
                <div className="text-xl font-bold text-green-400">
                  {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={startGame}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                🔄 Jogar Novamente
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ↩️ Voltar
              </button>
            </div>
          </div>
        )}

        {/* Recordes */}
        {highScores.length > 0 && (
          <div className="mt-6 p-3 bg-slate-700/50 rounded-lg">
            <h3 className="text-sm font-semibold mb-3 text-center text-yellow-300">🏆 Recordes</h3>
            <div className="space-y-2">
              {highScores.slice(0, 3).map((scoreData, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-2 rounded ${
                    index === 0 ? "bg-yellow-900/30 border border-yellow-600/40" : "bg-slate-600/40"
                  }`}
                >
                  <span className="text-sm font-medium">{scoreData.name}</span>
                  <span className="text-sm font-bold text-yellow-300">{scoreData.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}