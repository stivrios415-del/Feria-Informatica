// --- Datos fijos de la feria ---
export const CATEGORIAS = ['Desarrollo de Software', 'Robótica']

// Criterios de evaluación y sus pesos (deben sumar 1.0).
// Los "key" coinciden con las columnas de la tabla "calificaciones".
export const CRITERIOS = [
  { key: 'innovacion', label: 'Innovación', peso: 0.25 },
  { key: 'funcionalidad', label: 'Funcionalidad', peso: 0.25 },
  { key: 'diseno_ux', label: 'Diseño / UX', peso: 0.2 },
  { key: 'impacto_utilidad', label: 'Impacto / utilidad', peso: 0.15 },
  { key: 'presentacion', label: 'Presentación', peso: 0.15 },
]

export const NOTA_MAX = 100

// Puntos máximos que puede otorgar el juez en este criterio (ya reparte el peso).
// Ej: Innovación (25%) → hasta 25 puntos. Presentación (15%) → hasta 15 puntos.
export function puntosMaxCriterio(criterio) {
  return Math.round(criterio.peso * NOTA_MAX * 10) / 10
}

// La nota final es la suma directa de los puntos otorgados en cada criterio
// (cada uno ya tiene su propio tope según su peso, así que no hay que
// multiplicar de nuevo).
export function calcularNotaFinal(calif) {
  let total = 0
  CRITERIOS.forEach((c) => {
    total += Number(calif[c.key]) || 0
  })
  return Math.round(total * 100) / 100
}
