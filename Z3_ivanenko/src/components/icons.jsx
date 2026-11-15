// SVG icons copied from https://lucide.dev/icons/ and adapted to React.
// Original icon names: layers, flame, check, trash-2, plus, x.
// Shared sizes match this app. License: public/lucide-license.txt.
const common = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function IconStack() {
  return (
    <svg {...common}>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
      <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
      <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
    </svg>
  )
}

export function IconFlame() {
  return (
    <svg {...common}>
      <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
    </svg>
  )
}

export function IconCheck() {
  return (
    <svg {...common}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconTrash() {
  return (
    <svg {...common} width={18} height={18}>
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

export function IconPlus() {
  return (
    <svg {...common} width={18} height={18} strokeWidth={2.5}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

export function IconClose() {
  return (
    <svg {...common} width={20} height={20} strokeWidth={2.5}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
