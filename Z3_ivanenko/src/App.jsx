import { useState } from 'react'
import QuickAdd from './components/QuickAdd.jsx'
import StatTiles from './components/StatTiles.jsx'
import TaskDialog from './components/TaskDialog.jsx'
import TodoFilters from './components/TodoFilters.jsx'
import TodoForm from './components/TodoForm.jsx'
import TodoItem from './components/TodoItem.jsx'
import { useTodos } from './hooks/useTodos.js'
import { defaultRange } from './utils/dates.js'

export default function App() {
  const t = useTodos()

  // null = dialog closed; an object = dialog open, and these are the starting values of the form
  const [draft, setDraft] = useState(null)

  function openNewTask(title) {
    setDraft({ title, description: '', ...defaultRange() })
  }

  function handleCreate(data) {
    t.addTodo(data)
    setDraft(null)
  }

  return (
    <div className="shell">
      <header className="top">
        <h1 className="top__title">TODO List</h1>
      </header>

      <main className="main">
        <StatTiles
          total={t.todos.length}
          doneCount={t.doneCount}
          status={t.status}
          onStatusChange={t.setStatus}
        />

        <section className="card" aria-labelledby="tasks-title">
          <h2 id="tasks-title" className="card__title">
            Úlohy <span className="card__count">{t.visibleTodos.length}</span>
          </h2>

          <TodoFilters search={t.search} onSearchChange={t.setSearch} sortBy={t.sortBy} onSortChange={t.setSortBy} />

          {t.todos.length === 0 ? (
            <p className="empty">Zatiaľ žiadne úlohy. Pridaj prvú v lište dole.</p>
          ) : t.visibleTodos.length === 0 ? (
            <p className="empty">Tu nič nie je – skús iný filter alebo hľadanie.</p>
          ) : (
            <ul className="rows">
              {t.visibleTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} onToggle={t.toggleTodo} onDelete={t.deleteTodo} />
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="credits">
        <span className="credits__label">Postavené na</span>
        <a className="pill" href="https://react.dev" target="_blank" rel="noreferrer">React</a>
        <a className="pill" href="https://vite.dev" target="_blank" rel="noreferrer">Vite</a>
        <a className="pill" href="https://lucide.dev" target="_blank" rel="noreferrer">Lucide Icons</a>
        <a className="pill" href="https://fonts.google.com/specimen/Rubik" target="_blank" rel="noreferrer">
          Rubik
        </a>
        <span className="credits__label">WEBTE1, 2026</span>
      </footer>

      <QuickAdd onOpen={openNewTask} />

      <TaskDialog open={draft !== null} title="Nová úloha" onClose={() => setDraft(null)}>
        {/* The form exists only while the dialog is open, so every opening starts with a fresh form */}
        {draft && (
          <TodoForm
            initialValues={draft}
            onSubmit={handleCreate}
            onCancel={() => setDraft(null)}
            submitLabel="Pridať úlohu"
          />
        )}
      </TaskDialog>
    </div>
  )
}
