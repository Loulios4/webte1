import { formatInterval, isPast } from '../utils/dates.js'
import { IconCheck } from './icons.jsx'

// One row shows one task. Its buttons pass that task back to App.
export default function TodoItem({ todo, onEdit, onToggle, onDelete, disabled }) {
  const overdue = !todo.is_finished && isPast(todo.date_to)

  return (
    <li className={todo.is_finished ? 'row row--done' : 'row'}>
      <button
        type="button"
        className="check"
        aria-pressed={todo.is_finished}
        aria-label={todo.is_finished ? `Znovu otvoriť: ${todo.title}` : `Dokončiť: ${todo.title}`}
        disabled={disabled}
        onClick={() => onToggle(todo)}
      >
        {todo.is_finished && <IconCheck />}
      </button>

      <div className="row__body">
        <h3 className="row__title">{todo.title}</h3>
        {todo.description && <p className="row__desc">{todo.description}</p>}
        <p className="row__meta">
          <span>{formatInterval(todo.date_from, todo.date_to)}</span>
          {todo.is_finished && <span className="row__state row__state--done">dokončená</span>}
          {!todo.is_finished && !overdue && <span className="row__state">nedokončená</span>}
          {overdue && <span className="row__state row__state--late">po termíne</span>}
        </p>
      </div>

      <div className="row__actions">
        <button className="text-btn" aria-label={`Upraviť: ${todo.title}`} disabled={disabled} onClick={() => onEdit(todo)}>Upraviť</button>
        <button
          type="button"
          className="text-btn danger"
          aria-label={`Odstrániť: ${todo.title}`}
          onClick={() => onDelete(todo)}
          disabled={disabled}
        >
          Odstrániť
        </button>
      </div>
    </li>
  )
}
