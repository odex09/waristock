export const COUNTRY_CODES = [
  { code: '+228', country: '🇹🇬 Togo', flag: '🇹🇬', enabled: true },
  { code: '+229', country: '🇧🇯 Bénin', flag: '🇧🇯', enabled: true },
  { code: '+225', country: '🇨🇮 Côte d\'Ivoire', flag: '🇨🇮', enabled: false },
  { code: '+221', country: '🇸🇳 Sénégal', flag: '🇸🇳', enabled: false },
  { code: '+223', country: '🇲🇱 Mali', flag: '🇲🇱', enabled: false },
  { code: '+226', country: '🇧🇫 Burkina Faso', flag: '🇧🇫', enabled: false },
  { code: '+233', country: '🇬🇭 Ghana', flag: '🇬🇭', enabled: false },
]

export const PHONE_RULES = {
  '+228': {
    pattern: /^[89]\d{7}$/,
    operators: [
      { prefix: '90', name: 'Togocel' },
      { prefix: '91', name: 'Togocel' },
      { prefix: '92', name: 'Togocel' },
      { prefix: '93', name: 'Togocel' },
      { prefix: '94', name: 'Togocel' },
      { prefix: '95', name: 'Togocel' },
      { prefix: '96', name: 'Togocel' },
      { prefix: '97', name: 'Togocel' },
      { prefix: '98', name: 'Togocel' },
      { prefix: '99', name: 'Togocel' },
      { prefix: '80', name: 'Moov' },
      { prefix: '81', name: 'Moov' },
      { prefix: '82', name: 'Moov' },
      { prefix: '83', name: 'Moov' },
      { prefix: '84', name: 'Moov' },
      { prefix: '85', name: 'Moov' },
      { prefix: '86', name: 'Moov' },
      { prefix: '87', name: 'Moov' },
      { prefix: '88', name: 'Moov' },
      { prefix: '89', name: 'Moov' },
    ],
    format: '90 00 00 00',
    length: 8,
    message: 'Numéro invalide. Format attendu : 90 00 00 00',
  },
  '+229': {
    pattern: /^[56]\d{7}$/,
    operators: [
      { prefix: '60', name: 'MTN' },
      { prefix: '61', name: 'MTN' },
      { prefix: '62', name: 'MTN' },
      { prefix: '63', name: 'MTN' },
      { prefix: '64', name: 'MTN' },
      { prefix: '65', name: 'MTN' },
      { prefix: '66', name: 'MTN' },
      { prefix: '67', name: 'MTN' },
      { prefix: '68', name: 'MTN' },
      { prefix: '69', name: 'MTN' },
      { prefix: '50', name: 'Moov' },
      { prefix: '51', name: 'Moov' },
      { prefix: '52', name: 'Moov' },
      { prefix: '53', name: 'Moov' },
      { prefix: '54', name: 'Moov' },
      { prefix: '55', name: 'Moov' },
      { prefix: '56', name: 'Moov' },
      { prefix: '57', name: 'Moov' },
      { prefix: '58', name: 'Moov' },
      { prefix: '59', name: 'Moov' },
    ],
    format: '60 00 00 00',
    length: 8,
    message: 'Numéro invalide. Format attendu : 60 00 00 00',
  },
}

export function validatePhone(countryCode, rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '')
  const rule = PHONE_RULES[countryCode]

  if (!rule) {
    return { valid: false, message: 'Pays non supporté pour le moment.' }
  }

  if (!digits) {
    return { valid: false, message: 'Numéro requis' }
  }

  if (digits.length !== rule.length) {
    return {
      valid: false,
      message: `Le numéro doit contenir ${rule.length} chiffres. Format : ${rule.format}`,
    }
  }

  if (!rule.pattern.test(digits)) {
    return {
      valid: false,
      message: `Numéro invalide pour ce pays. Format attendu : ${rule.format}`,
    }
  }

  const operator = rule.operators.find((op) => digits.startsWith(op.prefix))
  return {
    valid: true,
    operator: operator?.name || null,
    formatted: formatPhone(digits, rule.format),
  }
}

export function formatPhone(digits, example) {
  const cleaned = String(digits || '').replace(/\D/g, '')
  const exampleDigits = example.replace(/\s/g, '')
  if (cleaned.length !== exampleDigits.length) return cleaned
  const out = []
  let ei = 0
  for (let i = 0; i < cleaned.length; i++) {
    if (exampleDigits[ei] === ' ') {
      out.push(' ')
      ei++
    }
    out.push(cleaned[i])
    ei++
  }
  return out.join('')
}
