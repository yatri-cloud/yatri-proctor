// Valid access codes for demo/testing
// Format: code → { candidateName, examTitle, durationMinutes, questionCount }

export interface MockSession {
  code: string
  candidateName: string
  examTitle: string
  examCode: string
  durationMinutes: number
  questionCount: number
  validUntil: string // ISO date
}

export const MOCK_SESSIONS: MockSession[] = [
  {
    code: '624-100-363',
    candidateName: 'Yatharth Chauhan',
    examTitle: 'AWS Certified Solutions Architect – Associate',
    examCode: 'SAA-C03',
    durationMinutes: 65,
    questionCount: 20,
    validUntil: '2027-12-31T23:59:59Z',
  },
  {
    code: '624100363',
    candidateName: 'Yatharth Chauhan',
    examTitle: 'AWS Certified Solutions Architect – Associate',
    examCode: 'SAA-C03',
    durationMinutes: 65,
    questionCount: 20,
    validUntil: '2027-12-31T23:59:59Z',
  },
  {
    code: '123456',
    candidateName: 'Yatharth Chauhan',
    examTitle: 'AWS Certified Solutions Architect – Associate',
    examCode: 'SAA-C03',
    durationMinutes: 65,
    questionCount: 20,
    validUntil: '2027-12-31T23:59:59Z',
  },
  {
    code: '654321',
    candidateName: 'Priya Sharma',
    examTitle: 'AWS Certified Developer – Associate',
    examCode: 'DVA-C02',
    durationMinutes: 65,
    questionCount: 20,
    validUntil: '2027-12-31T23:59:59Z',
  },
  {
    code: '111222',
    candidateName: 'Rahul Verma',
    examTitle: 'AWS Certified Cloud Practitioner',
    examCode: 'CLF-C02',
    durationMinutes: 65,
    questionCount: 20,
    validUntil: '2027-12-31T23:59:59Z',
  },
  {
    code: '999888',
    candidateName: 'Anita Patel',
    examTitle: 'Microsoft Azure Administrator',
    examCode: 'AZ-104',
    durationMinutes: 65,
    questionCount: 20,
    validUntil: '2027-12-31T23:59:59Z',
  },
]

export function validateAccessCode(code: string): MockSession | null {
  if (!code) return null
  const clean = code.replace(/\D/g, '')
  if (clean.length !== 6 && clean.length !== 9) return null
  return MOCK_SESSIONS.find(s => s.code.replace(/\D/g, '') === clean || s.code === code) ?? {
    code: clean,
    candidateName: 'Yatharth Chauhan',
    examTitle: 'AWS Certified Solutions Architect – Associate',
    examCode: 'SAA-C03',
    durationMinutes: 65,
    questionCount: 20,
    validUntil: '2027-12-31T23:59:59Z',
  }
}
