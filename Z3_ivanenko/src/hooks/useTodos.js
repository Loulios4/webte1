import { useState } from 'react'
import { sampleTodos } from '../data/sampleTodos.js'

// Custom hook = a function that uses React hooks and returns data + functions.
// All task logic lives here, the components only show it.
export function useTodos() {
  const [todos, setTodos] = useState(sampleTodos)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date_from')

  // Calculate the visible tasks directly each time the app renders.
  const query = search.trim().toLocaleLowerCase('sk')

  const visibleTodos = todos
    .filter((todo) => {
      if (status === 'open') return !todo.is_finished
      if (status === 'done') return todo.is_finished
      return true
    })
    .filter((todo) => todo.title.toLocaleLowerCase('sk').includes(query))
    // filter() creates a new array, so sorting it does not change todos.
    .sort((a, b) => new Date(a[sortBy]) - new Date(b[sortBy]))

  const doneCount = todos.filter((todo) => todo.is_finished).length

  // TEMPORARY
  function addTodo(data) {
    const nextId = Math.max(0, ...todos.map((todo) => todo.id)) + 1
    setTodos([...todos, { ...data, id: nextId }])
  }

  function toggleTodo(id) {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, is_finished: !todo.is_finished } : todo)))
  }

  function deleteTodo(todo) {
    if (!window.confirm(`Naozaj chceš odstrániť úlohu „${todo.title}“?`)) return
    setTodos(todos.filter((item) => item.id !== todo.id))
  }

  return {
    todos,
    visibleTodos,
    doneCount,
    status,
    setStatus,
    search,
    setSearch,
    sortBy,
    setSortBy,
    addTodo,
    toggleTodo,
    deleteTodo,
  }
}
