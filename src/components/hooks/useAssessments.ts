import { useEffect, useState } from 'react'
import { symbiFrameworkService } from '@/lib/symbi-framework'

export function useAssessments() {
  const [items, setItems] = useState(() => symbiFrameworkService.getAllAssessments())
  useEffect(() => {
    setItems(symbiFrameworkService.getAllAssessments())
  }, [])
  return { items }
}

