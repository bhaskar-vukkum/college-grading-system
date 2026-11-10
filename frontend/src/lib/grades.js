export const MAX_INTERNAL = 30
export const MAX_EXTERNAL = 70

export const GRADE_POINTS = { 'A+': 10, A: 9, 'B+': 8, B: 7, C: 6, P: 5 }
export const GRADE_ORDER = ['A+', 'A', 'B+', 'B', 'C', 'P']

export function gradeFor(total) {
  if (total >= 90) return 'A+'
  if (total >= 80) return 'A'
  if (total >= 70) return 'B+'
  if (total >= 60) return 'B'
  if (total >= 50) return 'C'
  return 'P'
}

export function computeGpa(marks) {
  const graded = (marks || []).filter((mark) => GRADE_POINTS[mark.grade] !== undefined && mark.credits)
  if (graded.length === 0) return 0
  const credits = graded.reduce((sum, mark) => sum + mark.credits, 0)
  const points = graded.reduce((sum, mark) => sum + GRADE_POINTS[mark.grade] * mark.credits, 0)
  return credits ? Math.round((points / credits) * 100) / 100 : 0
}

export function clampMark(value, max) {
  const number = Number(value)
  if (Number.isNaN(number)) return 0
  return Math.min(max, Math.max(0, Math.round(number)))
}

export function passMark(total) {
  return total >= 50
}

/** Average, spread and grade counts for a set of published marks. */
export function summarise(marks) {
  const graded = marks.filter((mark) => mark && typeof mark.total === 'number')
  if (graded.length === 0) {
    return { count: 0, average: 0, highest: 0, lowest: 0, passed: 0, passRate: 0, spread: [] }
  }

  const totals = graded.map((mark) => mark.total)
  const passed = graded.filter((mark) => passMark(mark.total)).length

  const spread = GRADE_ORDER.map((grade) => ({
    grade,
    count: graded.filter((mark) => mark.grade === grade).length,
  }))

  return {
    count: graded.length,
    average: Math.round(totals.reduce((sum, value) => sum + value, 0) / totals.length),
    highest: Math.max(...totals),
    lowest: Math.min(...totals),
    passed,
    passRate: Math.round((passed / graded.length) * 100),
    spread,
  }
}
