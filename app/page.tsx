"use client";
import { useState, useEffect, useCallback } from "react";

type Difficulty = "easy" | "medium" | "hard";

interface Question {
  question: string;
  options: string[];
  answer: string;
  difficulty: Difficulty;
}

interface ScoreEntry {
  name: string;
  score: number;
  total: number;
  date: string;
}

const questions: Question[] = [
  { question: "What does HTML stand for?", options: ["HyperText Markup Language", "High Transfer Markup Language", "HyperText Modern Language", "High Text Markup Logic"], answer: "HyperText Markup Language", difficulty: "easy" },
  { question: "Which tag is used for the largest heading in HTML?", options: ["<h6>", "<h1>", "<head>", "<title>"], answer: "<h1>", difficulty: "easy" },
  { question: "What does CSS stand for?", options: ["Cascading Style Sheets", "Computer Style System", "Creative Style Syntax", "Colorful Sheet Styles"], answer: "Cascading Style Sheets", difficulty: "easy" },
  { question: "Which language runs in the browser?", options: ["Python", "Java", "JavaScript", "C++"], answer: "JavaScript", difficulty: "easy" },
  { question: "What does DOM stand for?", options: ["Document Object Model", "Data Object Manager", "Document Open Method", "Dynamic Object Mode"], answer: "Document Object Model", difficulty: "medium" },
  { question: "Which CSS property changes text color?", options: ["font-color", "text-color", "color", "foreground"], answer: "color", difficulty: "easy" },
  { question: "What is React?", options: ["A database", "A server language", "A UI JavaScript library", "A CSS framework"], answer: "A UI JavaScript library", difficulty: "medium" },
  { question: "Which hook is used to manage state in React?", options: ["useEffect", "useContext", "useState", "useRef"], answer: "useState", difficulty: "medium" },
  { question: "What does API stand for?", options: ["Application Programming Interface", "Advanced Program Interaction", "App Protocol Index", "Automated Program Integration"], answer: "Application Programming Interface", difficulty: "medium" },
  { question: "Which method adds an item to the end of an array in JS?", options: ["push()", "pop()", "shift()", "append()"], answer: "push()", difficulty: "easy" },
  { question: "What is the output of typeof null in JavaScript?", options: ["null", "undefined", "object", "boolean"], answer: "object", difficulty: "hard" },
  { question: "What does 'async/await' help with in JavaScript?", options: ["Styling", "Routing", "Handling asynchronous code", "State management"], answer: "Handling asynchronous code", difficulty: "medium" },
  { question: "In Next.js, which folder contains your routes?", options: ["/src", "/pages or /app", "/routes", "/views"], answer: "/pages or /app", difficulty: "medium" },
  { question: "Which HTTP method is used to send data to a server?", options: ["GET", "DELETE", "POST", "FETCH"], answer: "POST", difficulty: "medium" },
  { question: "What is a closure in JavaScript?", options: ["A loop structure", "A function with access to its outer scope", "A CSS class", "A React hook"], answer: "A function with access to its outer scope", difficulty: "hard" },
];

const TIMER: Record<Difficulty, number> = { easy: 20, medium: 15, hard: 10 };
const LETTERS = ["A", "B", "C", "D"];
const MEDALS = ["🥇", "🥈", "🥉"];

export default function Home() {
  const [screen, setScreen] = useState<"name" | "quiz" | "score">("name");
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const filtered = questions.filter(q => q.difficulty === difficulty);
  const totalQ = filtered.length;
  const timerMax = TIMER[difficulty];

  const nextQuestion = useCallback(() => {
    if (currentQ + 1 < totalQ) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setTimeLeft(timerMax);
    } else {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeTaken(elapsed);
      setScreen("score");
    }
  }, [currentQ, totalQ, timerMax, startTime]);

  useEffect(() => {
    if (screen !== "quiz" || selected !== null) return;
    if (timeLeft <= 0) { nextQuestion(); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, screen, selected, nextQuestion]);

  useEffect(() => {
    if (screen === "score") {
      const entry: ScoreEntry = {
        name: playerName || "Anonymous",
        score,
        total: totalQ,
        date: new Date().toLocaleDateString(),
      };
      const stored = typeof window !== "undefined" ? localStorage.getItem("quizScores") : null;
      const prev: ScoreEntry[] = stored ? JSON.parse(stored) : [];
      const updated = [...prev, entry].sort((a, b) => b.score - a.score).slice(0, 10);
      localStorage.setItem("quizScores", JSON.stringify(updated));
      setLeaderboard(updated);
    }
  }, [screen]);

  function startQuiz() {
    if (!playerName.trim()) return;
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setTimeLeft(timerMax);
    setStartTime(Date.now());
    setScreen("quiz");
  }

  function handleAnswer(option: string) {
    if (selected) return;
    setSelected(option);
    if (option === filtered[currentQ].answer) setScore(s => s + 1);
    setTimeout(nextQuestion, 1000);
  }

  function playAgain() {
    setScreen("name");
    setScore(0);
    setCurrentQ(0);
    setSelected(null);
  }

  const timerPercent = (timeLeft / timerMax) * 100;
  const isDanger = timeLeft <= 3;
  const myIndex = leaderboard.findIndex(e => e.name === playerName && e.score === score);
  const mins = String(Math.floor(timeTaken / 60)).padStart(2, "0");
  const secs = String(timeTaken % 60).padStart(2, "0");

  return (
    <div className="quiz-wrapper">
      <div className="logo">⚡ QuizMaster</div>

      {/* NAME SCREEN */}
      {screen === "name" && (
        <div className="card">
          <div className="card-title">Ready to test<br />your knowledge? 🧠</div>
          <div className="card-sub">Enter your name and pick a difficulty</div>
          <input
            className="name-input"
            type="text"
            placeholder="Your name..."
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && startQuiz()}
          />
          <div className="difficulty-grid">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d, i) => (
              <div
                key={d}
                className={`diff-btn${difficulty === d ? " selected" : ""}`}
                onClick={() => setDifficulty(d)}
              >
                <span className="diff-icon">{["🌱", "🔥", "💀"][i]}</span>
                <span className="diff-label">{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                <span className="diff-desc">{TIMER[d]}s per Q</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={startQuiz}>Start Quiz →</button>
        </div>
      )}

      {/* QUIZ SCREEN */}
      {screen === "quiz" && (
        <div className="card">
          <div className="quiz-header">
            <div className="q-counter">
              Question <span>{currentQ + 1}</span> of <span>{totalQ}</span>
            </div>
            <div className="timer-wrap">
              <div className="timer-bar-wrap">
                <div
                  className={`timer-bar${isDanger ? " danger" : ""}`}
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
              <div className={`timer-num${isDanger ? " danger" : ""}`}>{timeLeft}</div>
            </div>
          </div>

          <div className="progress-dots">
            {filtered.map((_, i) => (
              <div key={i} className={`dot${i < currentQ ? " done" : i === currentQ ? " current" : ""}`} />
            ))}
          </div>

          <div className={`badge badge-${difficulty}`}>{difficulty}</div>
          <div className="question-text">{filtered[currentQ].question}</div>

          <div className="options">
            {filtered[currentQ].options.map((opt, i) => {
              let cls = "option";
              if (selected) {
                if (opt === filtered[currentQ].answer) cls += " correct";
                else if (opt === selected) cls += " wrong";
                else cls += " disabled";
              }
              return (
                <div
                  key={opt}
                  className={cls}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => handleAnswer(opt)}
                >
                  <div className="option-letter">{LETTERS[i]}</div>
                  {opt}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCORE SCREEN */}
      {screen === "score" && (
        <div className="card">
          <div style={{ textAlign: "center", fontSize: 13, color: "#666", marginBottom: "0.5rem" }}>
            Great job, <strong style={{ color: "#ccc" }}>{playerName}!</strong>
          </div>
          <div className="score-big">{score}/{totalQ}</div>
          <div className="score-label">
            {score === totalQ ? "Perfect score! 🏆" : score >= totalQ * 0.7 ? "Well done! 🎉" : "Keep practicing! 💪"}
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Correct</div>
              <div className="stat-val" style={{ color: "#4ade80" }}>{score}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Wrong</div>
              <div className="stat-val" style={{ color: "#f87171" }}>{totalQ - score}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Time</div>
              <div className="stat-val" style={{ color: "#a78bfa" }}>{mins}:{secs}</div>
            </div>
          </div>

          <hr className="divider" />
          <div className="lb-section-title">🏆 Leaderboard</div>

          {leaderboard.map((entry, i) => (
            <div key={i} className={`lb-row${i === myIndex ? " highlight" : ""}`}>
              <div className="lb-rank">{i < 3 ? MEDALS[i] : i + 1}</div>
              <div className="lb-name">
                {entry.name}
                {i === myIndex && <span className="you-tag">(you)</span>}
              </div>
              <div className="lb-score">{entry.score}/{entry.total}</div>
            </div>
          ))}

          <hr className="divider" />
          <button className="btn-primary" onClick={playAgain}>Play Again →</button>
        </div>
      )}
    </div>
  );
}