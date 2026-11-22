import { useState } from 'react'
import DateTimeFields from './DateTimeFields.jsx'
import { inputToIso } from '../utils/dates.js'
import { DESCRIPTION_MAX, TITLE_MAX, validateTodo } from '../utils/validation.js'

export default function TodoForm({ initialValues, original, onSubmit, onCancel, submitLabel, busy }) {
  // Keep edits in a draft until the user submits the form.
  const [form, setForm] = useState(initialValues)
  const [errors, setErrors] = useState({})

  // Use the input name to update just that field in the draft.
  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  function handleSubmit(event) {
    event.preventDefault()

    // Keep the original instant if a date wasn't edited (also during the repeated autumn hour).
    const from = original && form.dateFrom === initialValues.dateFrom ? original.date_from : form.dateFrom
    const to = original && form.dateTo === initialValues.dateTo ? original.date_to : form.dateTo
    const newErrors = validateTodo(form, from, to)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // Send all task fields, even when the user changes only the title.
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      date_from: inputToIso(from),
      date_to: inputToIso(to),
      is_finished: form.finished,
    })
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={busy}>
        <label className="field">
          <span className="field__label">Názov *</span>
          <input
            name="title"
            type="text"
            required
            value={form.title}
            onChange={handleChange}
            maxLength={TITLE_MAX}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <span className="field__error">{errors.title}</span>}
        </label>

        <label className="field">
          <span className="field__label">Popis</span>
          <textarea
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            maxLength={DESCRIPTION_MAX}
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && <span className="field__error">{errors.description}</span>}
        </label>

        <DateTimeFields form={form} errors={errors}
          onChange={(name, value) => setForm({ ...form, [name]: value })} />

        {original && (
          <label className="finish-field">
            <input type="checkbox" name="finished" checked={form.finished} onChange={handleChange} />
            Dokončená úloha
          </label>
        )}
        <div className="todo-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>Zrušiť</button>
          <button type="submit" className="btn btn--primary">{busy ? 'Ukladám…' : submitLabel}</button>
        </div>
      </fieldset>
    </form>
  )
}
