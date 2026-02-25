// ============================================================
// JoinScreen - Formulaire pour rejoindre un quiz
// ============================================================

import { useState } from "react";

interface JoinScreenProps {
  /** Callback appele quand le joueur soumet le formulaire */
  onJoin: (code: string, name: string) => void;
  /** Message d'erreur optionnel (ex: "Code invalide") */
  error?: string;
}

export default function JoinScreen({ onJoin, error }: JoinScreenProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // On s'assure que les champs ne contiennent pas que des espaces
    if (code.trim() && name.trim()) {
      onJoin(code.trim().toUpperCase(), name.trim());
    }
  };

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <h1>Rejoindre un Quiz</h1>

      {/* Affichage conditionnel de l'erreur envoyée par le serveur */}
      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="form-group">
        <label htmlFor="quizCode">Code PIN du jeu</label>
        <input
          id="quizCode"
          className="code-input"
          type="text"
          maxLength={6}
          placeholder="Ex: AB12CD"
          value={code}
          // On force la majuscule directement à la saisie pour plus de confort
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="playerName">Pseudo</label>
        <input
          id="playerName"
          type="text"
          placeholder="Ex: Hackerman"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn-primary">
        Entrer
      </button>
    </form>
  );
}
