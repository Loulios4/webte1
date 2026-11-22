import { useEffect, useState } from 'react'
import { WEEKDAYS, formatDate, formatInterval, formatTime } from '../utils/dates.js'

const VIEWS = { month: 'Mesiac', week: 'Týždeň', day: 'Deň' }

// Move in local calendar days, including when a day has 23 or 25 hours.
function addDays(day, count) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + count)
}

function monday(day) {
  const weekday = day.getDay() || 7
  return addDays(day, 1 - weekday)
}

function calendarDays(selected, view) {
  if (view === 'day') return [selected]

  let first = monday(selected)
  let last = addDays(first, 6)
  if (view === 'month') {
    const year = selected.getFullYear()
    const month = selected.getMonth()
    first = monday(new Date(year, month, 1))
    const lastOfMonth = new Date(year, month + 1, 0)
    last = addDays(monday(lastOfMonth), 6)
  }

  const days = []
  for (let day = first; day <= last; day = addDays(day, 1)) {
    days.push(day)
  }
  return days
}

// A task appears on each day that overlaps its start and end times.
function tasksOn(day, todos) {
  const nextDay = addDays(day, 1)
  return todos.filter((todo) => {
    const start = new Date(todo.date_from)
    const end = new Date(todo.date_to)
    // Include instantaneous tasks, but don't extend a task ending at midnight into the next day.
    return start < nextDay && (end > day || start.getTime() === day.getTime())
  })
}

function fullDate(day) {
  return day.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function eventTime(todo, day) {
  const startsHere = new Date(todo.date_from) >= day
  const endsHere = new Date(todo.date_to) < addDays(day, 1)
  if (startsHere && endsHere) return `${formatTime(todo.date_from)} – ${formatTime(todo.date_to)}`
  if (startsHere) return `od ${formatTime(todo.date_from)}`
  if (endsHere) return `do ${formatTime(todo.date_to)}`
  return 'celý deň'
}

function DayAgenda({ day, todos, onCreate, onDetail, disabled, singleDay }) {
  const items = tasksOn(day, todos)
  return (
    <section className="agenda-day" aria-label={fullDate(day)}>
      <div className="agenda-head">
        {singleDay
          ? <h3 className="cal-period" aria-live="polite">{fullDate(day)}</h3>
          : <h4>{fullDate(day)}</h4>}
        <button className="text-btn" disabled={disabled} onClick={() => onCreate(day)}>+ Pridať úlohu</button>
      </div>
      {items.length === 0 && <p className="agenda-empty">Žiadne naplánované úlohy.</p>}
      {items.map((todo) => (
        <button key={todo.id} className={'agenda-event' + (todo.is_finished ? ' finished' : '')}
          disabled={disabled} onClick={() => onDetail(todo)}>
          <strong>{todo.title}</strong>
          <span>{formatInterval(todo.date_from, todo.date_to)} · {todo.is_finished ? 'dokončená' : 'nedokončená'}</span>
        </button>
      ))}
    </section>
  )
}

export default function TodoCalendar({ todos, onCreate, onDetail, disabled }) {
  const [view, setView] = useState('month')
  const [today, setToday] = useState(() => addDays(new Date(), 0))
  const [selected, setSelected] = useState(today)
  useEffect(() => {
    const timer = setTimeout(() => setToday(addDays(new Date(), 0)), addDays(today, 1) - Date.now())
    return () => clearTimeout(timer)
  }, [today])
  const year = selected.getFullYear()
  const month = selected.getMonth()
  const days = calendarDays(selected, view)
  const ordered = [...todos].sort((a, b) => new Date(a.date_from) - new Date(b.date_from))

  function move(delta) {
    if (view === 'month') {
      const last = new Date(year, month + delta + 1, 0).getDate()
      setSelected(new Date(year, month + delta, Math.min(selected.getDate(), last)))
    } else {
      setSelected(addDays(selected, delta * (view === 'week' ? 7 : 1)))
    }
  }

  return (
    <section className="card calendar" aria-labelledby="calendar-title">
      <h2 id="calendar-title" className="card__title">Kalendár</h2>
      <div className="cal-toolbar">
        <div className="switcher" role="group" aria-label="Zobrazenie kalendára">
          {Object.entries(VIEWS).map(([key, label]) =>
            <button key={key} aria-pressed={view === key} onClick={() => setView(key)}>{label}</button>)}
        </div>
        <div className="cal-pager">
          <button aria-label="Predchádzajúce obdobie" onClick={() => move(-1)}>‹</button>
          <button onClick={() => setSelected(today)}>Dnes</button>
          <button aria-label="Nasledujúce obdobie" onClick={() => move(1)}>›</button>
        </div>
      </div>
      {view === 'month' && <h3 className="cal-period" aria-live="polite">{selected.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' })}</h3>}
      {view === 'week' && <h3 className="cal-period" aria-live="polite">{formatDate(days[0])} – {formatDate(days[6])}</h3>}
      {view === 'month' && (
        <div className="month-grid">
          {WEEKDAYS.map((day) => <div key={day} className="weekday">{day}</div>)}
          {days.map((day) => {
            const items = tasksOn(day, ordered)
            return (
              <div key={day.getTime()} className={'month-cell' + (day.getMonth() !== month ? ' adjacent' : '')}>
                <button className="day-pick" aria-label={`${fullDate(day)}, počet úloh: ${items.length}`} aria-pressed={day.getTime() === selected.getTime()}
                  aria-current={day.getTime() === today.getTime() ? 'date' : undefined} onClick={() => setSelected(day)}>
                  {day.getDate()}
                  <span className="day-count" aria-hidden="true">{items.length > 0 ? items.length : ''}</span>
                </button>
                {items.map((todo) =>
                  <button disabled={disabled} key={todo.id} className={'month-event' + (todo.is_finished ? ' finished' : '')}
                    title={`${todo.title} · ${formatInterval(todo.date_from, todo.date_to)} · ${todo.is_finished ? 'dokončená' : 'nedokončená'}`}
                    onClick={() => onDetail(todo)}>
                    <span>{todo.is_finished ? '✓ ' : ''}{todo.title}</span>
                    <small>{eventTime(todo, day)}</small>
                  </button>)}
              </div>
            )
          })}
        </div>
      )}
      {(view === 'month' ? [selected] : days).map((day) => (
        <DayAgenda key={day.getTime()} day={day} todos={ordered} onCreate={onCreate} onDetail={onDetail} disabled={disabled} singleDay={view === 'day'} />
      ))}
    </section>
  )
}
