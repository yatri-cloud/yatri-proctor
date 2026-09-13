import React, { createContext, useContext, useReducer, useEffect } from 'react'

export interface Question {
  id: number
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  options: { key: string; text: string }[]
  correctAnswer: string
  explanation: string
}

export interface ExamSession {
  accessCode: string | null
  sessionId: string | null
  candidateName: string
  currentScreen: number // 1–19
  equipment: {
    speakerPass: boolean | null
    micPass: boolean | null
    webcamPass: boolean | null
  }
  mobilePaired: boolean
  mobileToken: string | null
  personPhotoCaptured: boolean
  roomScansComplete: boolean
  roomScanDirections: ('front' | 'back' | 'left' | 'right')[]
  idCountry: string
  idType: string
  idVerified: boolean
  termsAccepted: boolean
  termsAcceptedAt: string | null
  systemCheckPass: boolean
  systemCheckResults: {
    networkMbps: number | null
    screenCount: number | null
    passed: boolean | null
  }
  finalFaceConfirmed: boolean
  questions: Question[]
  answers: Record<number, string>
  flaggedQuestions: number[]
  timeRemaining: number
  submittedAt: string | null
  score: number | null
  topicBreakdown: Record<string, { correct: number; total: number }>
}

const initialState: ExamSession = {
  accessCode: null,
  sessionId: null,
  candidateName: '',
  currentScreen: 1,
  equipment: { speakerPass: null, micPass: null, webcamPass: null },
  mobilePaired: false,
  mobileToken: null,
  personPhotoCaptured: false,
  roomScansComplete: false,
  roomScanDirections: [],
  idCountry: '',
  idType: '',
  idVerified: false,
  termsAccepted: false,
  termsAcceptedAt: null,
  systemCheckPass: false,
  systemCheckResults: { networkMbps: null, screenCount: null, passed: null },
  finalFaceConfirmed: false,
  questions: [],
  answers: {},
  flaggedQuestions: [],
  timeRemaining: 65 * 60, // 65 minutes
  submittedAt: null,
  score: null,
  topicBreakdown: {},
}

type Action =
  | { type: 'SET_ACCESS_CODE'; code: string; name: string; sessionId: string; token: string }
  | { type: 'SET_EQUIPMENT'; key: 'speakerPass' | 'micPass' | 'webcamPass'; value: boolean }
  | { type: 'SET_MOBILE_PAIRED'; token: string }
  | { type: 'ADD_ROOM_SCAN'; direction: 'front' | 'back' | 'left' | 'right' }
  | { type: 'SET_PERSON_PHOTO' }
  | { type: 'SET_ID_SELECTION'; country: string; idType: string }
  | { type: 'SET_ID_VERIFIED' }
  | { type: 'SET_TERMS_ACCEPTED' }
  | { type: 'SET_SYSTEM_CHECK'; results: ExamSession['systemCheckResults'] }
  | { type: 'SET_FINAL_FACE' }
  | { type: 'SET_QUESTIONS'; questions: Question[] }
  | { type: 'SET_ANSWER'; questionIndex: number; answer: string }
  | { type: 'TOGGLE_FLAG'; questionIndex: number }
  | { type: 'SET_SCREEN'; screen: number }
  | { type: 'TICK_TIMER' }
  | { type: 'SUBMIT_EXAM' }
  | { type: 'RESET' }

function computeScore(questions: Question[], answers: Record<number, string>) {
  let correct = 0
  const topicBreakdown: Record<string, { correct: number; total: number }> = {}

  questions.forEach((q, i) => {
    if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { correct: 0, total: 0 }
    topicBreakdown[q.topic].total++
    if (answers[i] === q.correctAnswer) {
      correct++
      topicBreakdown[q.topic].correct++
    }
  })

  return { score: Math.round((correct / questions.length) * 100), topicBreakdown }
}

function sessionReducer(state: ExamSession, action: Action): ExamSession {
  switch (action.type) {
    case 'SET_ACCESS_CODE':
      return { ...state, accessCode: action.code, candidateName: action.name, sessionId: action.sessionId, mobileToken: action.token, currentScreen: 2 }
    case 'SET_EQUIPMENT':
      return { ...state, equipment: { ...state.equipment, [action.key]: action.value } }
    case 'SET_MOBILE_PAIRED':
      return { ...state, mobilePaired: true, mobileToken: action.token }
    case 'ADD_ROOM_SCAN': {
      const dirs = state.roomScanDirections.includes(action.direction)
        ? state.roomScanDirections
        : [...state.roomScanDirections, action.direction]
      return { ...state, roomScanDirections: dirs, roomScansComplete: dirs.length >= 4 }
    }
    case 'SET_PERSON_PHOTO':
      return { ...state, personPhotoCaptured: true }
    case 'SET_ID_SELECTION':
      return { ...state, idCountry: action.country, idType: action.idType }
    case 'SET_ID_VERIFIED':
      return { ...state, idVerified: true }
    case 'SET_TERMS_ACCEPTED':
      return { ...state, termsAccepted: true, termsAcceptedAt: new Date().toISOString() }
    case 'SET_SYSTEM_CHECK':
      return { ...state, systemCheckResults: action.results, systemCheckPass: action.results.passed ?? false }
    case 'SET_FINAL_FACE':
      return { ...state, finalFaceConfirmed: true }
    case 'SET_QUESTIONS':
      return { ...state, questions: action.questions }
    case 'SET_ANSWER':
      return { ...state, answers: { ...state.answers, [action.questionIndex]: action.answer } }
    case 'TOGGLE_FLAG': {
      const flagged = state.flaggedQuestions.includes(action.questionIndex)
        ? state.flaggedQuestions.filter(i => i !== action.questionIndex)
        : [...state.flaggedQuestions, action.questionIndex]
      return { ...state, flaggedQuestions: flagged }
    }
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.screen }
    case 'TICK_TIMER':
      return { ...state, timeRemaining: Math.max(0, state.timeRemaining - 1) }
    case 'SUBMIT_EXAM': {
      const { score, topicBreakdown } = computeScore(state.questions, state.answers)
      return { ...state, submittedAt: new Date().toISOString(), score, topicBreakdown, currentScreen: 19 }
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const STORAGE_KEY = 'yatri-proctor-session'

interface ExamSessionContextValue {
  session: ExamSession
  dispatch: React.Dispatch<Action>
}

const ExamSessionContext = createContext<ExamSessionContextValue | null>(null)

export function ExamSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, dispatch] = useReducer(sessionReducer, initialState, (init) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : init
    } catch {
      return init
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      // quota exceeded — ignore
    }
  }, [session])

  return (
    <ExamSessionContext.Provider value={{ session, dispatch }}>
      {children}
    </ExamSessionContext.Provider>
  )
}

export function useExamSession() {
  const ctx = useContext(ExamSessionContext)
  if (!ctx) throw new Error('useExamSession must be used within ExamSessionProvider')
  return ctx
}
