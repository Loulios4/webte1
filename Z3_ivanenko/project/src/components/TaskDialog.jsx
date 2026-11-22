import { useEffect, useRef } from 'react'
import { IconClose } from './icons.jsx'

// Modal window built on the native HTML <dialog> element.
// The browser itself handles: dark backdrop, Esc to close, keeping focus inside the window.
// "open" comes from App.jsx; useEffect turns it into dialog.showModal() / dialog.close().
export default function TaskDialog({ open, title, onClose, busy, children }) {
  const dialogRef = useRef(null) // direct access to the <dialog> DOM element
  const pressedBackdrop = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.querySelector('input, textarea, select')?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // A click on the dark backdrop has the <dialog> itself as target -> close
  function handleClick(event) {
    if (!busy && pressedBackdrop.current && event.target === dialogRef.current) onClose()
  }

  return (
    <dialog ref={dialogRef} className="sheet" aria-labelledby="sheet-title" onClick={handleClick}
      onPointerDown={(event) => { pressedBackdrop.current = event.target === event.currentTarget }}
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}>
      <div className="sheet__inner">
        <div className="sheet__head">
          <h2 id="sheet-title" className="sheet__title">{title}</h2>
          <button type="button" className="icon-btn" aria-label="Zavrieť" disabled={busy} onClick={onClose}>
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
