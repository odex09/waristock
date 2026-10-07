export const ICONS = {
  home: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5V21H3z" />
      <path d="M9 21v-7h6v7" />
    </svg>
  ),
  box: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  ),
  plus: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  bell: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0" />
    </svg>
  ),
  menu: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  ),
  down: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v14M6 12l6 6 6-6" />
    </svg>
  ),
  up: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20V6M6 12l6-6 6 6" />
    </svg>
  ),
  check: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  users: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0M17 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6" />
    </svg>
  ),
  chart: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  ),
  gear: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </svg>
  ),
  search: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  ),
  back: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),
  phone: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
    </svg>
  ),
  chat: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-12 7l-6 2 2-5a8 8 0 1 1 16-4z" />
    </svg>
  ),
  list: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  ),
  sun: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  moon: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  wallet: (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12V7H3a2 2 0 0 1 0-4h18v16H3a2 2 0 0 1 0-4h18v-5z" />
      <circle cx="16" cy="12" r="2" />
    </svg>
  ),
}

export function Icon({ name, ..._props }) {
  return ICONS[name] || null
}
