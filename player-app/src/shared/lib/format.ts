export function formatScore(score: number): string {
  return new Intl.NumberFormat('fr-FR').format(score)
}
