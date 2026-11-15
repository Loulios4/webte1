import { IconCheck, IconFlame, IconStack } from './icons.jsx'

// Three tiles with counts. They are real buttons: a click changes the status filter.
export default function StatTiles({ total, doneCount, status, onStatusChange }) {
  const tiles = [
    { value: 'all', label: 'Všetky', count: total, Icon: IconStack },
    { value: 'open', label: 'Nedokončené', count: total - doneCount, Icon: IconFlame },
    { value: 'done', label: 'Dokončené', count: doneCount, Icon: IconCheck },
  ]

  return (
    <div className="tiles" role="group" aria-label="Filter podľa stavu">
      {tiles.map(({ value, label, count, Icon }) => (
        <button
          key={value}
          type="button"
          className={`tile tile--${value}`}
          aria-pressed={status === value}
          onClick={() => onStatusChange(value)}
        >
          <span className="tile__icon">
            <Icon />
          </span>
          <span className="tile__count">{count}</span>
          <span className="tile__label">{label}</span>
        </button>
      ))}
    </div>
  )
}
