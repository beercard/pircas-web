import { describe, expect, it } from 'vitest'

import { isComplete, recommend, scoreLines, type AdvisorConfig } from '@/lib/advisor'

const ECO = 1
const REF = 2
const MOD = 3
const w = (e: number, r: number, m: number) => [
  { lineId: ECO, points: e },
  { lineId: REF, points: r },
  { lineId: MOD, points: m },
]

const config: AdvisorConfig = {
  fallbackLineId: REF,
  lines: [
    {
      id: ECO,
      name: 'Herrero Económica',
      slug: 'herrero-economica',
      headline: 'Económica',
      text: '',
    },
    {
      id: REF,
      name: 'Herrero Reforzada',
      slug: 'herrero-reforzada',
      headline: 'Reforzada',
      text: '',
    },
    { id: MOD, name: 'Modena', slug: 'modena', headline: 'Modena', text: '' },
  ],
  questions: [
    {
      key: 'prioridad',
      question: '¿Qué priorizás?',
      answers: [
        { key: 'precio', label: 'Precio', weights: w(5, 2, 0) },
        { key: 'resistencia', label: 'Resistencia', weights: w(0, 5, 3) },
        { key: 'confort', label: 'Confort', weights: w(0, 2, 5) },
        { key: 'diseno', label: 'Diseño', weights: w(0, 1, 5) },
      ],
    },
    {
      key: 'lugar',
      question: '¿Dónde?',
      answers: [
        { key: 'casa', label: 'Casa', weights: w(1, 3, 2) },
        { key: 'departamento', label: 'Departamento', weights: w(1, 2, 3) },
      ],
    },
    {
      key: 'importancia',
      question: '¿Qué te importa más?',
      answers: [
        { key: 'aislacion', label: 'Aislación', weights: w(0, 1, 5) },
        { key: 'funcionalidad', label: 'Funcionalidad', weights: w(3, 3, 1) },
      ],
    },
  ],
}

describe('asesor virtual', () => {
  it('suma los puntos de cada respuesta por línea', () => {
    expect(
      scoreLines(config, {
        prioridad: 'precio',
        lugar: 'departamento',
        importancia: 'funcionalidad',
      }),
    ).toEqual({ [ECO]: 9, [REF]: 7, [MOD]: 4 })
  })

  it('recomienda la línea con más puntos', () => {
    expect(
      recommend(config, {
        prioridad: 'precio',
        lugar: 'departamento',
        importancia: 'funcionalidad',
      })?.line.id,
    ).toBe(ECO)
    expect(
      recommend(config, { prioridad: 'confort', lugar: 'departamento', importancia: 'aislacion' })
        ?.line.id,
    ).toBe(MOD)
    expect(
      recommend(config, { prioridad: 'resistencia', lugar: 'casa', importancia: 'funcionalidad' })
        ?.line.id,
    ).toBe(REF)
  })

  it('ordena las alternativas por puntaje', () => {
    const rec = recommend(config, {
      prioridad: 'confort',
      lugar: 'casa',
      importancia: 'aislacion',
    })!
    expect(rec.alternatives.map((l) => l.id)).toEqual([REF, ECO])
  })

  it('desempata con la línea configurada y luego por orden del catálogo', () => {
    // Sin respuestas: todas en 0 → gana la línea de desempate.
    expect(recommend(config, {})?.line.id).toBe(REF)
    // Sin línea de desempate → la primera del catálogo.
    expect(recommend({ ...config, fallbackLineId: null }, {})?.line.id).toBe(ECO)
  })

  it('ignora respuestas desconocidas y puntos negativos', () => {
    const cfg: AdvisorConfig = {
      ...config,
      questions: [
        {
          key: 'q',
          question: 'q',
          answers: [
            {
              key: 'a',
              label: 'a',
              weights: [
                { lineId: MOD, points: -10 },
                { lineId: 99, points: 5 },
              ],
            },
          ],
        },
      ],
    }
    expect(scoreLines(cfg, { q: 'a', otra: 'x' })).toEqual({ [ECO]: 0, [REF]: 0, [MOD]: 0 })
  })

  it('sabe cuándo se respondió todo', () => {
    expect(isComplete(config, { prioridad: 'precio', lugar: 'casa' })).toBe(false)
    expect(
      isComplete(config, { prioridad: 'precio', lugar: 'casa', importancia: 'aislacion' }),
    ).toBe(true)
  })

  it('devuelve null si no hay líneas', () => {
    expect(recommend({ ...config, lines: [] }, {})).toBeNull()
  })
})
