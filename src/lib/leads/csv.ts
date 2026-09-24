/**
 * Generación de CSV compatible con Excel (separador `;` habitual en es-AR, BOM UTF-8).
 * Se protegen las celdas contra "CSV injection" (valores que empiezan con = + - @).
 */

export type CsvColumn<T> = { header: string; value: (row: T) => unknown }

const FORMULA_START = /^[=+\-@\t\r]/

export function escapeCsvCell(value: unknown, separator = ';'): string {
  if (value === null || value === undefined) return ''
  let s = value instanceof Date ? value.toISOString() : String(value)
  if (FORMULA_START.test(s)) s = `'${s}`
  if (s.includes('"') || s.includes(separator) || s.includes('\n') || s.includes('\r')) {
    s = `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[], separator = ';'): string {
  const lines = [
    columns.map((c) => escapeCsvCell(c.header, separator)).join(separator),
    ...rows.map((row) =>
      columns.map((c) => escapeCsvCell(c.value(row), separator)).join(separator),
    ),
  ]
  return '﻿' + lines.join('\r\n')
}
