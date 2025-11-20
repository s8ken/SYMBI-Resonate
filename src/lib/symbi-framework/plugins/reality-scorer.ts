import { registerScorer } from './registry'

registerScorer({
  name: 'basic-reality-scorer',
  dimension: 'reality',
  async score(input) {
    const text = input.content.toLowerCase()
    const terms = ['goal','objective','purpose','mission']
    const hits = terms.reduce((c,t)=>c+(text.includes(t)?1:0),0)
    return { hits }
  }
})

