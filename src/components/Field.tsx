import { useState } from 'react'
import { hebrewYearString } from '../domain/hebrewDate'

// כותרת שדה עם כפתור הסבר (?) שנפתח/נסגר
export function FieldHead({ label, help, htmlFor }: { label: string; help: string; htmlFor?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="ctl-head">
        <label htmlFor={htmlFor}>{label}</label>
        <button
          type="button"
          className="help-btn"
          aria-label={`הסבר על ${label}`}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          ?
        </button>
      </div>
      {open && <div className="help-box">{help}</div>}
    </>
  )
}

// בורר שנה עברית (במקום קלט מספרי) — from גבוהה אל to נמוכה
export function HebrewYearSelect({
  id,
  value,
  onChange,
  from,
  to,
}: {
  id?: string
  value: number
  onChange: (y: number) => void
  from: number
  to: number
}) {
  const years: number[] = []
  for (let y = from; y >= to; y--) years.push(y)
  const hasValue = years.includes(value)
  return (
    <select id={id} value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))}>
      {!hasValue && <option value={value}>{hebrewYearString(value)}</option>}
      {years.map((y) => (
        <option key={y} value={y}>
          {hebrewYearString(y)}
        </option>
      ))}
    </select>
  )
}
