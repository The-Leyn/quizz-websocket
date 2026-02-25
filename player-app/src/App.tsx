import { useEffect, useState } from 'react'
import type { QuizPhase, QuizQuestion } from '@shared/index'
import { useWebSocket } from './shared/hooks/useWebSocket'
import { Button, ConnectionBadge } from './shared/ui'
import {
  EndedPage,
  FeedbackPage,
  JoinPage,
  LeaderboardPage,
  LobbyPage,
  QuestionPage,
} from './pages'

const WS_URL = 'ws://localhost:3001'
const IS_DEV = import.meta.env.DEV

type AppPhase = QuizPhase | 'join' | 'feedback'

const PREVIEW_PHASES: Array<{ value: AppPhase; label: string }> = [
  { value: 'join', label: 'Join' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'question', label: 'Question' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'leaderboard', label: 'Classement' },
  { value: 'ended', label: 'Fin' },
]

const PREVIEW_PLAYERS = ['Amina', 'Lucas', 'Nora', 'Yanis', 'Manon']
const PREVIEW_QUESTION: Omit<QuizQuestion, 'correctIndex'> = {
  id: 'preview-q1',
  text: 'Quel protocole est full-duplex en temps reel ?',
  choices: ['REST', 'WebSocket', 'GraphQL', 'SOAP'],
  timerSec: 20,
}
const PREVIEW_RANKINGS = [
  { name: 'Amina', score: 3600 },
  { name: 'Lucas', score: 3200 },
  { name: 'Nora', score: 2900 },
  { name: 'Yanis', score: 2500 },
  { name: 'Manon', score: 2200 },
]

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL)

  const [phase, setPhase] = useState<AppPhase>('join')
  const [playerName, setPlayerName] = useState('')
  const [currentQuizCode, setCurrentQuizCode] = useState('')
  const [players, setPlayers] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Omit<QuizQuestion, 'correctIndex'> | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [lastSelectedChoice, setLastSelectedChoice] = useState<number | null>(null)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [rankings, setRankings] = useState<{ name: string; score: number }[]>([])
  const [error, setError] = useState<string | undefined>(undefined)

  const [previewMode, setPreviewMode] = useState<boolean>(IS_DEV)
  const [previewPhase, setPreviewPhase] = useState<AppPhase>('join')
  const [previewCorrect, setPreviewCorrect] = useState<boolean>(true)

  useEffect(() => {
    if (!lastMessage) return

    switch (lastMessage.type) {
      case 'sync': {
        setPhase(lastMessage.phase)
        break
      }

      case 'joined': {
        setPlayers(lastMessage.players)
        setPhase('lobby')
        setError(undefined)
        break
      }

      case 'question': {
        setCurrentQuestion(lastMessage.question)
        setRemaining(lastMessage.question.timerSec)
        setHasAnswered(false)
        setLastSelectedChoice(null)
        setPhase('question')
        break
      }

      case 'tick': {
        setRemaining(lastMessage.remaining)
        break
      }

      case 'results': {
        const isCorrect =
          lastSelectedChoice !== null && lastSelectedChoice === lastMessage.correctIndex

        setLastCorrect(isCorrect)
        setScore(lastMessage.scores[playerName] ?? 0)
        setPhase('feedback')
        break
      }

      case 'leaderboard': {
        setRankings(lastMessage.rankings)
        setPhase('leaderboard')
        break
      }

      case 'ended': {
        setPhase('ended')
        break
      }

      case 'error': {
        setError(lastMessage.message)
        break
      }
    }
  }, [lastMessage, lastSelectedChoice, playerName])

  const handleJoin = (code: string, name: string) => {
    const safeCode = code.trim().toUpperCase()
    const safeName = name.trim()

    if (!safeCode || !safeName) return

    setPlayerName(safeName)
    setCurrentQuizCode(safeCode)
    setError(undefined)

    if (previewMode) {
      setPreviewPhase('lobby')
      return
    }

    sendMessage({ type: 'join', quizCode: safeCode, name: safeName })
  }

  const handleAnswer = (choiceIndex: number) => {
    if (hasAnswered || !currentQuestion) return

    setHasAnswered(true)
    setLastSelectedChoice(choiceIndex)

    if (previewMode) {
      setPreviewCorrect(choiceIndex === 1)
      setScore((prevScore) => (prevScore > 0 ? prevScore : 2450))
      setPreviewPhase('feedback')
      return
    }

    sendMessage({
      type: 'answer',
      questionId: currentQuestion.id,
      choiceIndex,
    })
  }

  const handleRestart = () => {
    setPhase('join')
    setPlayers([])
    setCurrentQuestion(null)
    setRemaining(0)
    setHasAnswered(false)
    setLastSelectedChoice(null)
    setLastCorrect(false)
    setScore(0)
    setRankings([])
    setError(undefined)
    setCurrentQuizCode('')

    if (previewMode) {
      setPreviewPhase('join')
    }
  }

  const displayPhase = previewMode ? previewPhase : phase
  const displayPlayerName = previewMode ? playerName || 'Toi' : playerName
  const displayPlayers = previewMode ? (players.length > 0 ? players : PREVIEW_PLAYERS) : players
  const displayQuestion = previewMode ? currentQuestion ?? PREVIEW_QUESTION : currentQuestion
  const displayRemaining = previewMode ? (remaining > 0 ? remaining : PREVIEW_QUESTION.timerSec) : remaining
  const displayRankings = previewMode ? (rankings.length > 0 ? rankings : PREVIEW_RANKINGS) : rankings
  const displayScore = previewMode ? (score > 0 ? score : 2450) : score
  const displayCorrect = previewMode ? previewCorrect : lastCorrect

  const renderPhase = () => {
    switch (displayPhase) {
      case 'join':
        return <JoinPage onJoin={handleJoin} error={error} />

      case 'lobby':
        return <LobbyPage players={displayPlayers} />

      case 'question':
        return displayQuestion ? (
          <QuestionPage
            question={displayQuestion}
            remaining={displayRemaining}
            onAnswer={handleAnswer}
            hasAnswered={hasAnswered}
          />
        ) : null

      case 'feedback':
      case 'results':
        return <FeedbackPage correct={displayCorrect} score={displayScore} />

      case 'leaderboard':
        return <LeaderboardPage rankings={displayRankings} playerName={displayPlayerName} />

      case 'ended':
        return <EndedPage onRestart={handleRestart} />

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-app text-text">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-accent sm:text-lg">Quiz Player</h2>
          {currentQuizCode ? (
            <p className="text-xs text-text-muted">Code: {currentQuizCode}</p>
          ) : null}
        </div>
        <ConnectionBadge status={status} />
      </header>

      <main className="flex flex-1 items-center justify-center px-3 py-5 sm:px-4 sm:py-6">
        <div className="w-full pb-24 sm:pb-8">{renderPhase()}</div>
      </main>

      {IS_DEV ? (
        <aside className="fixed inset-x-2 bottom-2 z-30 rounded-2xl border border-border bg-surface/95 p-2 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-4 sm:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="md"
              variant={previewMode ? 'primary' : 'secondary'}
              onClick={() => setPreviewMode((prev) => !prev)}
              aria-pressed={previewMode}
            >
              Preview {previewMode ? 'ON' : 'OFF'}
            </Button>

            {previewMode
              ? PREVIEW_PHASES.map((item) => (
                  <Button
                    key={item.value}
                    size="md"
                    variant={previewPhase === item.value ? 'primary' : 'ghost'}
                    onClick={() => {
                      if (item.value === 'question') {
                        setHasAnswered(false)
                        setLastSelectedChoice(null)
                      }
                      setPreviewPhase(item.value)
                    }}
                  >
                    {item.label}
                  </Button>
                ))
              : null}

            {previewMode && (previewPhase === 'feedback' || previewPhase === 'results') ? (
              <Button
                size="md"
                variant="secondary"
                onClick={() => setPreviewCorrect((prev) => !prev)}
              >
                {previewCorrect ? 'Mode Correct' : 'Mode Incorrect'}
              </Button>
            ) : null}
          </div>
        </aside>
      ) : null}
    </div>
  )
}

export default App
