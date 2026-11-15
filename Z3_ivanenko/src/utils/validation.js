// Checks the form values. Returns an object with an error message for each wrong field,
// e.g. { title: "Názov je povinný." }. An empty object means the form is valid.
export const TITLE_MAX = 200
export const DESCRIPTION_MAX = 1000

export function validateTodo(form) {
  const errors = {}

  if (form.title.trim() === '') {
    errors.title = 'Názov je povinný.'
  } else if (form.title.length > TITLE_MAX) {
    errors.title = `Názov môže mať najviac ${TITLE_MAX} znakov.`
  }

  if (form.description.length > DESCRIPTION_MAX) {
    errors.description = `Popis môže mať najviac ${DESCRIPTION_MAX} znakov.`
  }

  if (form.dateFrom === '') {
    errors.dateFrom = 'Zadaj začiatok úlohy.'
  }
  if (form.dateTo === '') {
    errors.dateTo = 'Zadaj koniec úlohy.'
  }
  if (form.dateFrom !== '' && form.dateTo !== '' && new Date(form.dateFrom) > new Date(form.dateTo)) {
    errors.dateTo = 'Koniec nemôže byť skôr ako začiatok.'
  }

  return errors
}
