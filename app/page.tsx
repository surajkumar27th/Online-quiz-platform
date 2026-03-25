"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const questions = [
    {
      question: "Capital of India?",
      options: ["Delhi", "Mumbai", "Chennai", "Kolkata"],
      answer: "Delhi",
    },
    {
      question: "2 + 2 = ?",
      options: ["3", "4", "5", "6"],
      answer: "4",
    },
    {
      question: "Largest planet?",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      answer: "Jupiter",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [time, setTime] = useState(10);
  const [name, setName] = useState("");
  const [scores, setScores] = useState<any[]>([]);

  // Timer
  useEffect(() => {
    if (time > 0 && !showScore) {
      const timer = setTimeout(() => setTime(time - 1), 1000);
      return () => clearTimeout(timer);
    } else if (time === 0) {
      handleAnswer("");
    }
  }, [time]);

  // Load leaderboard (SAFE)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = JSON.parse(localStorage.getItem("scores") || "[]");
      data.sort((a: any, b: any) => b.score - a.score);
      setScores(data);
    }
  }, [showScore]);

  // Save score
  const saveScore = () => {
    if (typeof window !== "undefined") {
      const data = JSON.parse(localStorage.getItem("scores") || "[]");
      const updated = [...data, { name: name || "Anonymous", score }];
      localStorage.setItem("scores", JSON.stringify(updated));
      updated.sort((a: any, b: any) => b.score - a.score);
      setScores(updated);
    }
  };

  const handleAnswer = (option: string) => {
    if (option === questions[current].answer) {
      setScore(score + 1);
    }

    const next = current + 1;
    if (next < questions.length) {
      setCurrent(next);
      setTime(10);
    } else {
      setShowScore(true);
      saveScore();
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Online Quiz</h1>

      {showScore ? (
        <div>
          <h2>Your Score: {score}</h2>

          <h3>Leaderboard</h3>
          {scores.map((s: any, i: number) => (
            <p key={i}>
              {s.name} - {s.score}
            </p>
          ))}
        </div>
      ) : (
        <div>
          {/* Name Input */}
          {current === 0 && (
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: "10px", margin: "10px" }}
            />
          )}

          <h3>{questions[current].question}</h3>
          <p>Time left: {time}s</p>

          {questions[current].options.map((opt, i) => (
            <div key={i}>
              <button
                onClick={() => handleAnswer(opt)}
                style={{ margin: "10px", padding: "10px 20px" }}
              >
                {opt}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}