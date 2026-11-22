import { useState } from 'react'
import { IconPlus } from './icons.jsx'

// Bar fixed at the bottom of the screen: "+" button and a field for the task name.
// Enter or "+" opens the dialog with the full form; the typed name is already filled in.
export default function QuickAdd({ onOpen, disabled }) {
  const [title, setTitle] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onOpen(title.trim())
    setTitle('')
  }

  return (
    <form className="quick-add" onSubmit={handleSubmit}>
      <button type="submit" className="quick-add__plus" aria-label="Nová úloha" disabled={disabled}>
        <IconPlus />
      </button>
      <label className="visually-hidden" htmlFor="quick-title">Názov novej úlohy</label>
      <input
        id="quick-title"
        type="text"
        disabled={disabled}
        className="quick-add__input"
        placeholder="Pridať úlohu…"
        maxLength={200}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
    </form>
  )
}
