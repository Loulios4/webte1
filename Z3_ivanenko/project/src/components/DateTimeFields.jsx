import { useRef, useState } from 'react'
import { WEEKDAYS, formatDate, toInputValue } from '../utils/dates.js'

const fields = { dateFrom: 'Začiatok', dateTo: 'Koniec' }

function clockOptions(count) {
  return Array.from({ length: count }, (_, i) => {
    const number = String(i).padStart(2, '0')
    return <option key={number}>{number}</option>
  })
}

export default function DateTimeFields({ form, errors, onChange }) {
  const [active, setActive] = useState(null)
  const [month, setMonth] = useState(null)
  const trigger = useRef(null)

  function open(name, button) {
    trigger.current = button
    const date = new Date(form[name])
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    setActive(active === name ? null : name)
  }

  function close() {
    setActive(null)
    trigger.current?.focus()
  }

  function moveMonth(offset) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1))
  }

  const [date, time = ''] = active ? form[active].split('T') : []
  const [hour, minute] = time.split(':')
  const days = month ? new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() : 0

  return (
    <div className="todo-form__dates" onKeyDown={(event) => {
      if (active && event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        close()
      }
    }}>
      {Object.entries(fields).map(([name, label]) => (
        <div className="field" key={name}>
          <label className="field__label" htmlFor={name}>{label} *</label>
          <button type="button" id={name} className="datetime-trigger" aria-expanded={active === name}
            aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? name + '-error' : undefined}
            onClick={(event) => open(name, event.currentTarget)}>
            {formatDate(form[name])} · {form[name].split('T')[1]}
            <span aria-hidden="true">▾</span>
          </button>
          {errors[name] && <span className="field__error" id={name + '-error'}>{errors[name]}</span>}
        </div>
      ))}
      {active && (
        <section className="datetime-panel" aria-label={fields[active]}>
          <div className="datetime-month">
            <button type="button" aria-label="Predchádzajúci mesiac" onClick={() => moveMonth(-1)}>‹</button>
            <strong aria-live="polite">{month.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' })}</strong>
            <button type="button" aria-label="Nasledujúci mesiac" onClick={() => moveMonth(1)}>›</button>
          </div>
          <div className="datetime-days">
            {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
            {Array.from({ length: days }, (_, i) => {
              const day = new Date(month.getFullYear(), month.getMonth(), i + 1)
              const key = toInputValue(day).split('T')[0]
              return <button type="button" key={key} aria-label={formatDate(day)} aria-pressed={key === date}
                style={i === 0 ? { gridColumnStart: day.getDay() || 7 } : undefined}
                onClick={() => onChange(active, key + 'T' + time)}>{i + 1}</button>
            })}
          </div>
          <div className="datetime-clock">
            <span>Čas</span>
            <select aria-label="Hodina" value={hour} onChange={(e) => onChange(active, `${date}T${e.target.value}:${minute}`)}>
              {clockOptions(24)}
            </select>
            <span aria-hidden="true">:</span>
            <select aria-label="Minúta" value={minute} onChange={(e) => onChange(active, `${date}T${hour}:${e.target.value}`)}>
              {clockOptions(60)}
            </select>
            <button type="button" className="btn btn--primary" onClick={close}>Hotovo</button>
          </div>
        </section>
      )}
    </div>
  )
}
