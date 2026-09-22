// --- Datos fijos de la feria ---
export const CATEGORIAS = ['Desarrollo de Software', 'Robótica']

// Criterios de evaluación y sus pesos (deben sumar 1.0).
// Los "key" coinciden con las columnas de la tabla "calificaciones".
// Escala de calificación por criterio: 1 a 10
export const CRITERIOS = [
  { key: 'innovacion', label: 'Innovación', peso: 0.25 },
  { key: 'funcionalidad', label: 'Funcionalidad', peso: 0.25 },
  { key: 'diseno_ux', label: 'Diseño / UX', peso: 0.2 },
  { key: 'impacto_utilidad', label: 'Impacto / utilidad', peso: 0.15 },
  { key: 'presentacion', label: 'Presentación', peso: 0.15 },
]

export const ESCALA_MIN = 1
export const ESCALA_MAX = 10

// Calcula la nota final ponderada (sobre 10) a partir de una fila de calificación
export function calcularNotaFinal(calif) {
  let total = 0
  CRITERIOS.forEach((c) => {
    total += (Number(calif[c.key]) || 0) * c.peso
  })
  return Math.round(total * 100) / 100
}
