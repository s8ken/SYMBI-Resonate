import { SymbiTimelineChart } from './charts/SymbiTimelineChart'
import type { AssessmentResult } from '@/lib/symbi-framework'

export function TrendChartWrapper({ results }: { results: AssessmentResult[] }) {
  return <SymbiTimelineChart data={results.map(r => r.assessment)} />
}

