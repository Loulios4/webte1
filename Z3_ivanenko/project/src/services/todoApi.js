const login = new URLSearchParams(window.location.search).get('login')?.trim()
export const STUDENT = login && login.length <= 100 && login !== '.' && login !== '..' ? login : 'xivanenko'
// The login in the URL selects the student's task list.
const listUrl = 'https://wt1zadanie.iolab.sk/api/' + encodeURIComponent(STUDENT)

async function request(path = '', method = 'GET', body, signal) {
  const timeout = AbortSignal.timeout(15000)
  let response
  try {
    response = await fetch(listUrl + path, {
      method,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
    // A 204 response has no body to read. Other successful responses contain JSON.
    if (response.ok) return response.status === 204 ? null : await response.json()
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('Odpoveď servera sa nepodarilo načítať. Skontroluj pripojenie a obnov zoznam.')
  }

  const messages = {
    403: 'Server nepovolil prístup pre tento login.',
    404: 'Úloha už na serveri neexistuje. Obnov zoznam.',
    422: 'Server odmietol zadané údaje. Skontroluj názov, dátumy a čas.',
  }
  throw new Error(messages[response.status] ?? `Server vrátil chybu ${response.status}. Skús to znova.`)
}

export async function listTodos(signal) {
  return (await request('', 'GET', undefined, signal)).todos
}

export const getTodo = (id) => request('/' + id)
export const createTodo = (data) => request('', 'POST', data)
export const replaceTodo = (id, data) => request('/' + id, 'PUT', data)
export const removeTodo = (id) => request('/' + id, 'DELETE')
export const changeStatus = (todo) => request(`/${todo.id}/${todo.is_finished ? 'undone' : 'done'}`, 'PATCH')
export async function resetTodos() {
  return (await request('/reset', 'POST')).todos
}
