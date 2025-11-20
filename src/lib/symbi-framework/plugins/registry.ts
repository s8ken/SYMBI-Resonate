export type Dimension = 'reality' | 'trust' | 'ethics' | 'resonance' | 'parity'

export interface DimensionScorer {
  name: string
  dimension: Dimension
  score(input: { content: string, metadata?: Record<string, unknown> }): Promise<Record<string, unknown>>
}

const registry: DimensionScorer[] = []

export function registerScorer(scorer: DimensionScorer) {
  registry.push(scorer)
}

export function getScorers(): DimensionScorer[] { return registry.slice() }

