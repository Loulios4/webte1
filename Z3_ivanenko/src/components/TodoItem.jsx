import { formatInterval, isPast } from '../utils/dates.js'
import { IconCheck, IconTrash } from './icons.jsx'

// One task row: round check button, text, time and a delete button.
// Like MealItem.vue in zadanie8: data comes through props, clicks go up through onToggle / onDelete.
export default function TodoItem({ todo, onToggle, onDelete }) {
  const overdue = !todo.is_finished && isPast(todo.date_to)

  let className = 'row'
  if (todo.is_finished) className += ' row--done'
  if (overdue) className += ' row--overdue'

  return (
    <li className={className}>
      <button
        type="button"
        className="check"
        aria-pressed={todo.is_finished}
        aria-label={todo.is_finished ? `Znovu otvoriť: ${todo.title}` : `Dokončiť: ${todo.title}`}
        onClick={() => onToggle(todo.id)}
      >
        {todo.is_finished && <IconCheck />}
      </button>

      <div className="row__body">
        <h3 className="row__title">{todo.title}</h3>
        {todo.description && <p className="row__desc">{todo.description}</p>}
        <p className="row__meta">
          <span>{formatInterval(todo.date_from, todo.date_to)}</span>
          {todo.is_finished && <span className="row__state row__state--done">dokončená</span>}
          {overdue && <span className="row__state row__state--late">po termíne</span>}
        </p>
      </div>

      <button
        type="button"
        className="icon-btn icon-btn--danger"
        aria-label={`Odstrániť: ${todo.title}`}
        onClick={() => onDelete(todo)}
      >
        <IconTrash />
      </button>
    </li>
  )
}
