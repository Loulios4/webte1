import { useState } from 'react'
import QuickAdd from './components/QuickAdd.jsx'
import StatTiles from './components/StatTiles.jsx'
import TaskDialog from './components/TaskDialog.jsx'
import TodoCalendar from './components/TodoCalendar.jsx'
import TodoFilters from './components/TodoFilters.jsx'
import TodoForm from './components/TodoForm.jsx'
import TodoItem from './components/TodoItem.jsx'
import { useTodos } from './hooks/useTodos.js'
import { STUDENT } from './services/todoApi.js'
import { defaultRange, formatInterval, toInputValue } from './utils/dates.js'

const PAGES = { list: 'Zoznam', calendar: 'Kalendár', about: 'O projekte' }

export default function App() {
  // The list and calendar share the tasks from this hook.
  const t = useTodos()
  const [page, setPage] = useState('list')
  const [dialog, setDialog] = useState(null)
  const busy = Boolean(t.pending)
  const unavailable = busy || !t.ready
  const activeTodo = dialog?.id != null ? t.todos.find((todo) => todo.id === dialog.id) : null

  function openNew(title = '', day) {
    t.clearNotice()
    setDialog({ type: 'new', values: { title, description: '', finished: false, ...defaultRange(day) } })
  }

  // Fill the edit form with the selected task and show its dates in local time.
  function openEdit(todo) {
    t.clearNotice()
    setDialog({
      type: 'edit', id: todo.id, original: todo,
      values: { title: todo.title, description: todo.description, finished: todo.is_finished,
        dateFrom: toInputValue(new Date(todo.date_from)), dateTo: toInputValue(new Date(todo.date_to)) },
    })
  }

  async function openDetail(todo) {
    if (await t.loadDetail(todo.id)) {
      t.clearNotice()
      setDialog({ type: 'detail', id: todo.id })
    }
  }

  async function save(data) {
    // Keep the draft open if saving fails so the user can try again.
    if (await t.save(dialog.id, data)) setDialog(null)
  }

  async function deleteDetail() {
    if (await t.remove(activeTodo)) setDialog(null)
  }

  const feedback = (
    <div role={t.notice?.error ? 'alert' : 'status'} className={'feedback' + (t.notice?.error ? ' feedback--error' : '')}>
      {t.pending || t.notice?.text}
    </div>
  )

  return (
    <div className="shell">
      <header className="top">
        <div className="top__line">
          <h1 className="top__title">TODO List</h1>
          <form className="login" method="get" onSubmit={(event) => {
            const input = event.currentTarget.elements.login
            input.value = input.value.trim()
            if (!input.reportValidity()) event.preventDefault()
          }}>
            <input type="text" aria-label="Študentský login" name="login" defaultValue={STUDENT} required maxLength={100}
              pattern="(?![.]{1,2}$).*\S.*" title="Zadaj študentský login." />
            <button className="btn btn--ghost" disabled={busy}>Otvoriť zoznam</button>
          </form>
        </div>
        <nav className="page-nav" aria-label="Hlavná navigácia">
          {Object.entries(PAGES).map(([key, label]) => (
            <button key={key} aria-current={page === key ? 'page' : undefined} onClick={() => setPage(key)}>{label}</button>
          ))}
        </nav>
      </header>

      <main className="main">
        {page === 'list' && t.ready && (
          <>
            <StatTiles total={t.todos.length} doneCount={t.doneCount} status={t.status} onStatusChange={t.setStatus} />
            <section className="card" aria-labelledby="tasks-title">
              <h2 id="tasks-title" className="card__title">Úlohy <span className="card__count">{t.visibleTodos.length}</span></h2>
              <TodoFilters search={t.search} onSearchChange={t.setSearch} sortBy={t.sortBy} onSortChange={t.setSortBy} />
              {t.visibleTodos.length === 0 ? (
                <p className="empty">{t.todos.length ? 'Žiadne úlohy nezodpovedajú filtru alebo hľadaniu.' : 'Zatiaľ žiadne úlohy. Pridaj prvú v lište dole.'}</p>
              ) : (
                <ul className="rows">
                  {t.visibleTodos.map((todo) => <TodoItem key={todo.id} todo={todo} onToggle={t.toggle} onDelete={t.remove} onEdit={openEdit} disabled={busy} />)}
                </ul>
              )}
            </section>
          </>
        )}
        {t.ready && <div hidden={page !== 'calendar'}>
          <TodoCalendar todos={t.todos} disabled={busy} onCreate={(day) => openNew('', day)} onDetail={openDetail} />
        </div>}
        {page !== 'about' && (
          <div className="sync-bar">
            {!dialog && feedback}
            <div className="sync-actions">
              <button className="text-btn" onClick={t.reload} disabled={busy}>Načítať znova</button>
              {page === 'list' && t.ready && (
                <button className="text-btn" onClick={t.reset} disabled={busy}>Obnoviť ukážkové úlohy</button>
              )}
            </div>
          </div>
        )}
        {page === 'about' && (
          <section className="card about" aria-labelledby="about-title">
            <h2 className="card__title" id="about-title">O projekte</h2>
            <p>Môj TODO List je osobný plánovač pre predmet WEBTE1. Úlohy môžeš spravovať v zozname alebo si ich rozvrhnúť v kalendári.</p>
            <p>Rozhranie je vytvorené v Reacte a zostavené nástrojom Vite. Úlohy sa ukladajú na školskom serveri cez REST API. Aplikácia s ním komunikuje pomocou Fetch API.</p>
            <p>Kalendár je vlastný komponent v Reacte. Pomocou objektu Date zobrazuje úlohy v miestnom čase podľa mesiaca, týždňa alebo dňa.</p>
            <p>Ikona stránky pochádza zo <a href="https://www.svgrepo.com/">SVG Repo</a>.</p>
            <a href="https://wt1zadanie.iolab.sk/docs">Dokumentácia školského API</a>
          </section>
        )}
      </main>

      <footer className="credits">
        <a className="pill" href="https://react.dev">React</a>
        <a className="pill" href="https://vite.dev">Vite</a>
        <a className="pill" href="https://lucide.dev">Lucide Icons</a>
        <a className="pill" href="https://fonts.google.com/specimen/Rubik">Rubik</a>
      </footer>
      {page !== 'about' && <QuickAdd onOpen={openNew} disabled={unavailable} />}

      <TaskDialog open={Boolean(dialog)} title={dialog?.type === 'detail' ? 'Podrobnosti úlohy' : dialog?.type === 'edit' ? 'Upraviť úlohu' : 'Nová úloha'}
        busy={busy} onClose={() => setDialog(null)}>
        {dialog?.type === 'detail' && activeTodo && (
          <div className="detail">
            <h3>{activeTodo.title}</h3>
            {activeTodo.description && <p>{activeTodo.description}</p>}
            <p>{formatInterval(activeTodo.date_from, activeTodo.date_to)}</p>
            <p>{activeTodo.is_finished ? 'Dokončená' : 'Nedokončená'}</p>
            <div className="detail-actions">
              <button className="btn btn--primary" disabled={busy} onClick={() => openEdit(activeTodo)}>Upraviť</button>
              <button className="btn btn--ghost" disabled={busy} onClick={() => t.toggle(activeTodo)}>{activeTodo.is_finished ? 'Znovu otvoriť' : 'Dokončiť'}</button>
              <button className="text-btn danger" disabled={busy} onClick={deleteDetail}>Odstrániť</button>
            </div>
          </div>
        )}
        {dialog?.values && <TodoForm initialValues={dialog.values} original={dialog.original} onSubmit={save}
          onCancel={() => setDialog(null)} submitLabel={dialog.type === 'edit' ? 'Uložiť zmeny' : 'Pridať úlohu'} busy={busy} />}
        {dialog && feedback}
      </TaskDialog>
    </div>
  )
}
