export const formatCurrency = (amount) =>
  Math.round(amount).toLocaleString('fr-FR').replace(/\u202f/g, ' ')

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const getToday = () => new Date().toISOString().split('T')[0]

export const classNames = (...classes) =>
  classes.filter(Boolean).join(' ')
