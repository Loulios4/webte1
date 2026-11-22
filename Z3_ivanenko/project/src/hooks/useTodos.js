import { useEffect, useRef, useState } from 'react'
import * as api from '../services/todoApi.js'

export function useTodos() {
  const [todos, setTodos] = useState(null)
  const [pending, setPending] = useState('Načítavam úlohy…')
  const [notice, setNotice] = useState(null)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date_from')
  const locked = useRef(false)

  // Load the list from the server when the app opens.
  useEffect(() => {
    const controller = new AbortController()
    api.listTodos(controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return
        setTodos(items)
      })
      .catch((error) => {
        if (!controller.signal.aborted) setNotice({ text: error.message, error: true })
      })
      .finally(() => {
        if (!controller.signal.aborted) setPending('')
      })
    return () => controller.abort()
  }, [])

  async function run(label, action, message) {
    // Ignore a second click while the first request is still running.
    if (locked.current || pending) return false
    locked.current = true
    setPending(label)
    setNotice(null)
    try {
      await action()
      setNotice({ text: message })
      return true
    } catch (error) {
      setNotice({ text: error.message, error: true })
      return false
    } finally {
      locked.current = false
      setPending('')
    }
  }

  // Replace the task with the same ID using the copy returned by the server.
  function updateItem(item) {
    setTodos((items) => items.map((old) => old.id === item.id ? item : old))
  }

  function reload() {
    return run('Načítavam úlohy…', async () => setTodos(await api.listTodos()), 'Zoznam je aktuálny.')
  }

  function loadDetail(id) {
    return run('Načítavam podrobnosti…', async () => updateItem(await api.getTodo(id)), 'Podrobnosti sú načítané.')
  }

  function save(id, data) {
    return run('Ukladám úlohu…', async () => {
      if (id != null) {
        updateItem(await api.replaceTodo(id, data))
      } else {
        // The school API can reset the whole list when creating a 51st task.
        const items = await api.listTodos()
        setTodos(items)
        if (items.length >= 50) throw new Error('Zoznam je plný (50 úloh). Pred pridaním odstráň jednu úlohu.')
        const created = await api.createTodo(data)
        setTodos([...items, created])
      }
    }, id == null ? 'Úloha je pridaná.' : 'Zmeny sú uložené.')
  }

  function toggle(todo) {
    return run('Mením stav úlohy…', async () => updateItem(await api.changeStatus(todo)),
      todo.is_finished ? 'Úloha je znova otvorená.' : 'Úloha je dokončená.')
  }

  function remove(todo) {
    if (!window.confirm(`Odstrániť úlohu „${todo.title}“?`)) return false
    return run('Odstraňujem úlohu…', async () => {
      await api.removeTodo(todo.id)
      setTodos((items) => items.filter((item) => item.id !== todo.id))
    }, 'Úloha je odstránená.')
  }

  function reset() {
    if (!window.confirm('Všetky tvoje aktuálne úlohy sa odstránia a nahradia sa piatimi ukážkovými úlohami. Pokračovať?')) return
    return run('Obnovujem ukážkové úlohy…', async () => {
      setTodos(await api.resetTodos())
      try {
        setTodos(await api.listTodos())
      } catch {
        throw new Error('Ukážkové úlohy sú obnovené. Kontrola zoznamu zlyhala. Skús znova načítať úlohy.')
      }
    }, 'Ukážkové úlohy sú obnovené.')
  }

  const items = todos ?? []
  const query = search.trim().toLocaleLowerCase('sk')
  // Search and sort the list on screen. The calendar still uses all tasks.
  const visibleTodos = items.filter((todo) => {
    const matchesStatus = status === 'all' || todo.is_finished === (status === 'done')
    return matchesStatus && todo.title.toLocaleLowerCase('sk').includes(query)
  }).sort((a, b) => new Date(a[sortBy]) - new Date(b[sortBy]))

  return {
    todos: items, ready: todos !== null, visibleTodos, doneCount: items.filter((todo) => todo.is_finished).length,
    status, setStatus, search, setSearch, sortBy, setSortBy, pending, notice, clearNotice: () => setNotice(null),
    reload, loadDetail, save, toggle, remove, reset,
  }
}
