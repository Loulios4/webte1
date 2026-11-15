// TEMPORARY test data. In the next step the tasks will be loaded from the REST API instead.
// The fields have the same names as in the API (title, description, date_from, date_to, is_finished).

// Date "days" days from today at the given hour, as an ISO string
function inDays(days, hour, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

export const sampleTodos = [
  {
    id: 1,
    title: 'Odovzdať zadanie z WEBTE1',
    description: 'ZIP s index.html a README.md, odkaz na školský server.',
    date_from: inDays(1, 18),
    date_to: inDays(1, 23, 59),
    is_finished: false,
  },
  {
    id: 2,
    title: 'Nákup na víkend',
    description: 'Mlieko, chlieb, vajíčka, káva.',
    date_from: inDays(-2, 16),
    date_to: inDays(-2, 17),
    is_finished: true,
  },
  {
    id: 3,
    title: 'Zaplatiť nájom',
    description: '',
    date_from: inDays(-1, 9),
    date_to: inDays(-1, 10),
    is_finished: false,
  },
  {
    id: 4,
    title: 'Výlet do Tatier',
    description: 'Trojdňový výlet, rezervácia chaty je hotová.',
    date_from: inDays(4, 8),
    date_to: inDays(6, 18),
    is_finished: false,
  },
  {
    id: 5,
    title: 'Prečítať kapitolu o React hookoch',
    description: 'useState, useEffect, useMemo.',
    date_from: inDays(0, 19),
    date_to: inDays(0, 21),
    is_finished: false,
  },
]
