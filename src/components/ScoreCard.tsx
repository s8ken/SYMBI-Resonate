import { SymbiScoreCard } from './SymbiScoreCard'
import type { AssessmentResult } from '@/lib/symbi-framework'

export function ScoreCard({ result }: { result: AssessmentResult }) {
  return <SymbiScoreCard assessment={result.assessment} />
}

