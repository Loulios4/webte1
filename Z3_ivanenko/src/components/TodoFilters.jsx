// Search by title and sort by date. (Status filter = the StatTiles above the list.)
// The values live in the useTodos hook; this component only shows them and reports changes.

const SORT_OPTIONS = [
  { value: 'date_from', label: 'Začiatku' },
  { value: 'date_to', label: 'Konca' },
]

export default function TodoFilters({ search, onSearchChange, sortBy, onSortChange }) {
  return (
    <div className="filters">
      <label className="field field--inline">
        <span className="field__label">Hľadať</span>
        <input
          type="search"
          placeholder="Názov úlohy…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      {/* Two-option switch instead of a <select>: real radio buttons, styled as one pill */}
      <div className="field field--inline">
        <span className="field__label" id="sort-label">Zoradiť podľa</span>
        <div className="segment" role="radiogroup" aria-labelledby="sort-label">
          {SORT_OPTIONS.map((option) => (
            <label key={option.value} className="segment__option">
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={sortBy === option.value}
                onChange={() => onSortChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
