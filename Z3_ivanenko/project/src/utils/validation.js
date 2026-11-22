// Checks the form values. Returns an object with an error message for each wrong field,
// e.g. { title: "Názov je povinný." }. An empty object means the form is valid.
export const TITLE_MAX = 200
export const DESCRIPTION_MAX = 1000

function validLocalTime(value) {
  const date = new Date(value)
  // A skipped local hour during the spring clock change is normalised by Date.
  return Number.isFinite(date.getTime()) && date.getHours() === Number(value.slice(11, 13))
}

export function validateTodo(form, from = form.dateFrom, to = form.dateTo) {
  const errors = {}

  if (form.title.trim() === '') {
    errors.title = 'Názov je povinný.'
  } else if (form.title.length > TITLE_MAX) {
    errors.title = `Názov môže mať najviac ${TITLE_MAX} znakov.`
  }

  if (form.description.length > DESCRIPTION_MAX) {
    errors.description = `Popis môže mať najviac ${DESCRIPTION_MAX} znakov.`
  }

  if (!validLocalTime(form.dateFrom)) {
    errors.dateFrom = 'Zadaj platný dátum a čas začiatku.'
  }
  if (!validLocalTime(form.dateTo)) {
    errors.dateTo = 'Zadaj platný dátum a čas ukončenia.'
  }
  if (!errors.dateFrom && !errors.dateTo && new Date(from) > new Date(to)) {
    errors.dateTo = 'Koniec nemôže byť skôr ako začiatok.'
  }

  return errors
}
