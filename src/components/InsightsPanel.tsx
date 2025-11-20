import type { AssessmentResult } from '@/lib/symbi-framework'

export function InsightsPanel({ result }: { result: AssessmentResult }) {
  const insights = result.insights
  return (
    <div>
      <h3>Insights</h3>
      <ul>
        {insights.strengths.map((s, i) => (<li key={`s-${i}`}>{s}</li>))}
      </ul>
    </div>
  )
}

