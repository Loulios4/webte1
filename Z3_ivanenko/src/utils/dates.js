// Helper functions for dates. The app keeps dates as ISO strings (e.g. "2026-11-20T09:00:00.000Z")
// and shows them in the user's local time.

const LOCALE = 'sk-SK'

// "20. 11. 2026"
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(LOCALE)
}

// "09:00"
export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })
}

// Same day:  "20. 11. 2026, 09:00 – 11:30"
// More days: "20. 11. 2026, 09:00 – 22. 11. 2026, 18:00"
export function formatInterval(fromIso, toIso) {
  const from = `${formatDate(fromIso)}, ${formatTime(fromIso)}`
  if (formatDate(fromIso) === formatDate(toIso)) {
    return `${from} – ${formatTime(toIso)}`
  }
  return `${from} – ${formatDate(toIso)}, ${formatTime(toIso)}`
}

// Parts for the small "tear-off calendar" block: { day: 20, month: "nov" }
export function dayAndMonth(iso) {
  const date = new Date(iso)
  return {
    day: date.getDate(),
    month: date.toLocaleDateString(LOCALE, { month: 'short' }).replace('.', ''),
  }
}

// <input type="datetime-local"> gives local time without a zone ("2026-11-20T09:00").
// new Date() reads it as local time, toISOString() turns it into UTC ISO 8601.
export function inputToIso(value) {
  return new Date(value).toISOString()
}

export function isPast(iso) {
  return new Date(iso) < new Date()
}

// Date object -> "2026-11-20T09:00" (the format <input type="datetime-local"> needs), in local time
export function toInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

// Default times for a new task: from the next full hour, 1 hour long
export function defaultRange() {
  const start = new Date()
  start.setHours(start.getHours() + 1, 0, 0, 0)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)
  return { dateFrom: toInputValue(start), dateTo: toInputValue(end) }
}
