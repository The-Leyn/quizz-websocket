// ============================================================
// CreateQuiz - Formulaire de creation d'un quiz
// ============================================================

import { useState } from "react";
import type { QuizQuestion } from "@shared/index";

interface CreateQuizProps {
  /** Callback appele quand le formulaire est soumis */
  onSubmit: (title: string, questions: QuizQuestion[]) => void;
}

export default function CreateQuiz({ onSubmit }: CreateQuizProps) {
  const [title, setTitle] = useState("");

  // On initialise avec une question vide par defaut pour l'UX
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: crypto.randomUUID(),
      text: "",
      choices: ["", "", "", ""],
      correctIndex: 0,
      timerSec: 15, // 15 secondes par défaut
    },
  ]);

  // --- Handlers pour modifier dynamiquement les questions ---

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        text: "",
        choices: ["", "", "", ""],
        correctIndex: 0,
        timerSec: 15,
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (
    id: string,
    field: keyof QuizQuestion,
    value: string | number,
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const updateChoice = (
    questionId: string,
    choiceIndex: number,
    value: string,
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newChoices = [...q.choices];
          newChoices[choiceIndex] = value;
          return { ...q, choices: newChoices };
        }
        return q;
      }),
    );
  };

  // --- Soumission du formulaire ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations de sécurité
    if (!title.trim()) {
      alert("Veuillez entrer un titre pour le quiz.");
      return;
    }

    if (questions.length === 0) {
      alert("Le quiz doit contenir au moins une question.");
      return;
    }

    const isValid = questions.every(
      (q) =>
        q.text.trim() !== "" &&
        q.choices.every((c) => c.trim() !== "") &&
        q.timerSec > 0,
    );

    if (!isValid) {
      alert("Veuillez remplir tous les champs des questions et des choix.");
      return;
    }

    // Si tout est bon, on envoie les donnees au composant App
    onSubmit(title, questions);
  };

  return (
    <div className="phase-container">
      <h1>Créer un Quiz</h1>

      <form className="create-form" onSubmit={handleSubmit}>
        {/* Titre du Quiz */}
        <div className="form-group">
          <label htmlFor="quiz-title">Titre du Quiz</label>
          <input
            id="quiz-title"
            type="text"
            placeholder="Ex: Culture Générale"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Liste dynamique des questions */}
        {questions.map((q, qIndex) => (
          <div key={q.id} className="question-card">
            <div className="question-card-header">
              <h3>Question {qIndex + 1}</h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => handleRemoveQuestion(q.id)}
                >
                  Supprimer
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Intitulé de la question</label>
              <input
                type="text"
                placeholder="Ex: Quelle est la capitale de la France ?"
                value={q.text}
                onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Temps imparti (secondes)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={q.timerSec}
                onChange={(e) =>
                  updateQuestion(
                    q.id,
                    "timerSec",
                    parseInt(e.target.value) || 15,
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Choix de réponses (cochez la bonne réponse)</label>
              <div className="choices-inputs">
                {q.choices.map((choice, cIndex) => (
                  <div key={cIndex} className="choice-input-group">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctIndex === cIndex}
                      onChange={() =>
                        updateQuestion(q.id, "correctIndex", cIndex)
                      }
                    />
                    <input
                      type="text"
                      placeholder={`Choix ${cIndex + 1}`}
                      value={choice}
                      onChange={(e) =>
                        updateChoice(q.id, cIndex, e.target.value)
                      }
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Actions du formulaire */}
        <button
          type="button"
          className="btn-add-question"
          onClick={handleAddQuestion}
        >
          + Ajouter une question
        </button>

        <button type="submit" className="btn-primary">
          Créer le quiz et ouvrir la salle
        </button>
      </form>
    </div>
  );
}
