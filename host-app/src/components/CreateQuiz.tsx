// ============================================================
// CreateQuiz - Formulaire de creation d'un quiz
// A IMPLEMENTER : construire le formulaire dynamique
// ============================================================

import { useState } from 'react'
import type { QuizQuestion } from '@shared/index'

interface CreateQuizProps {
  /** Callback appele quand le formulaire est soumis */
  onSubmit: (title: string, questions: QuizQuestion[]) => void
}

/**
 * Composant formulaire pour creer un nouveau quiz.
 *
 * Ce qu'il faut implementer :
 * - Un champ pour le titre du quiz
 * - Une liste dynamique de questions (pouvoir en ajouter/supprimer)
 * - Pour chaque question :
 *   - Un champ texte pour la question
 *   - 4 champs texte pour les choix de reponse
 *   - Un selecteur (radio) pour la bonne reponse (correctIndex)
 *   - Un champ pour la duree du timer en secondes
 * - Un bouton pour ajouter une question
 * - Un bouton pour soumettre le formulaire
 *
 * Astuce : utilisez un state pour stocker un tableau de questions
 * et generez un id unique pour chaque question (ex: crypto.randomUUID())
 *
 * Classes CSS disponibles : .create-form, .form-group, .question-card,
 * .question-card-header, .choices-inputs, .choice-input-group,
 * .btn-add-question, .btn-remove, .btn-primary
 */
function CreateQuiz({ onSubmit }: CreateQuizProps) {
  // State pour le titre
  const [title, setTitle] = useState('')
  // State pour la liste des questions
  const [questions, setQuestions] = useState<QuizQuestion[]>([])

  // Ajouter une question vide
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      text: '',
      choices: ['', '', '', ''],
      correctIndex: 0,
      timerSec: 15,
    }
    setQuestions([...questions, newQuestion])
  }

  // Supprimer une question par son id
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  // Mettre a jour un champ d'une question (text, correctIndex, timerSec)
  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    )
  }

  // Mettre a jour un choix specifique d'une question
  const updateChoice = (questionId: string, choiceIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newChoices = [...q.choices]
          newChoices[choiceIndex] = value
          return { ...q, choices: newChoices }
        }
        return q
      })
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Valider que le titre n'est pas vide
    if (!title.trim()) {
      alert('Le titre du quiz ne peut pas etre vide')
      return
    }
    // Valider qu'il y a au moins 1 question
    if (questions.length === 0) {
      alert('Le quiz doit contenir au moins une question')
      return
    }
    // Valider que chaque question a un texte et 4 choix non-vides
    for (const question of questions) {
      if (!question.text.trim()) {
        alert('Chaque question doit avoir un texte')
        return
      }
      if (question.choices.some((c) => !c.trim())) {
        alert('Chaque choix de reponse doit etre renseigne')
        return
      }
    }
    // Appeler onSubmit(title, questions)
    onSubmit(title, questions)
  }

  return (
    <div className="phase-container">
      <h1>Creer un Quiz</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        {/* Champ titre */}
        <div className="form-group">
          <label htmlFor="quiztitle">Titre du quiz</label>
          <input
            type="text"
            id="quiztitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Liste des questions avec .question-card */}
        {questions.map((q, index) => (
          <div key={q.id} className="question-card">
            <div className="question-card-header">
              <h3>Question {index + 1}</h3>
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeQuestion(q.id)}
              >
                Supprimer
              </button>
            </div>

            <div className="form-group">
              <label>Intitulé de la question</label>
              <input
                type="text"
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              />
            </div>

            <div className="choices-inputs">
              {q.choices.map((choice, cIndex) => (
                <div key={cIndex} className="choice-input-group">
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === cIndex}
                    onChange={() => updateQuestion(q.id, { correctIndex: cIndex })}
                  />
                  <input
                    type="text"
                    value={choice}
                    placeholder={`Choix ${cIndex + 1}`}
                    onChange={(e) => updateChoice(q.id, cIndex, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Timer (secondes)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={q.timerSec}
                onChange={(e) =>
                  updateQuestion(q.id, { timerSec: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        ))}

        {/* Bouton ajouter une question */}
        <button type="button" className="btn-add-question" onClick={addQuestion}>
          + Ajouter une question
        </button>

        {/* Bouton soumettre */}
        <button type="submit" className="btn-primary">
          Créer le Quiz
        </button>
      </form>
    </div>
  )
}

export default CreateQuiz
