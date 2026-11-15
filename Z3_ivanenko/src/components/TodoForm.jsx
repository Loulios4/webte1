import { useState } from 'react'
import { inputToIso } from '../utils/dates.js'
import { DESCRIPTION_MAX, TITLE_MAX, validateTodo } from '../utils/validation.js'

// Form for a task. The whole form is one object in state;
// each input is "controlled": value comes from state, onChange writes back to state.
// initialValues = what the form starts with (name from the quick-add bar, default times).
export default function TodoForm({ initialValues, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initialValues)
  const [errors, setErrors] = useState({})

  // One change handler for all inputs: input name = key in the form object.
  // We create a NEW object ({ ...form }) – React only re-renders when state is replaced.
  function handleChange(event) {
    const { name, value } = event.target
    setForm({ ...form, [name]: value })
  }

  function handleSubmit(event) {
    event.preventDefault() // Vue: @submit.prevent

    const newErrors = validateTodo(form)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // Same field names as the REST API expects
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      date_from: inputToIso(form.dateFrom),
      date_to: inputToIso(form.dateTo),
      is_finished: false,
    })
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">Názov *</span>
        <input
          name="title"
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

      <div className="todo-form__dates">
        <label className="field">
          <span className="field__label">Začiatok *</span>
          <input
            type="datetime-local"
            name="dateFrom"
            value={form.dateFrom}
            onChange={handleChange}
            aria-invalid={Boolean(errors.dateFrom)}
          />
          {errors.dateFrom && <span className="field__error">{errors.dateFrom}</span>}
        </label>

        <label className="field">
          <span className="field__label">Koniec *</span>
          <input
            type="datetime-local"
            name="dateTo"
            value={form.dateTo}
            onChange={handleChange}
            aria-invalid={Boolean(errors.dateTo)}
          />
          {errors.dateTo && <span className="field__error">{errors.dateTo}</span>}
        </label>
      </div>

      <div className="todo-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Zrušiť</button>
        <button type="submit" className="btn btn--primary">{submitLabel}</button>
      </div>
    </form>
  )
}
