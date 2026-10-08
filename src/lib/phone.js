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
    pattern: /^[79]\d{7}$/,
    operators: [
      { prefix: '70', name: 'Togocel' },
      { prefix: '71', name: 'Togocel' },
      { prefix: '72', name: 'Togocel' },
      { prefix: '73', name: 'Togocel' },
      { prefix: '78', name: 'Moov' },
      { prefix: '79', name: 'Moov' },
      { prefix: '90', name: 'Togocel' },
      { prefix: '91', name: 'Togocel' },
      { prefix: '92', name: 'Togocel' },
      { prefix: '93', name: 'Togocel' },
      { prefix: '96', name: 'Moov' },
      { prefix: '97', name: 'Moov' },
      { prefix: '98', name: 'Moov' },
      { prefix: '99', name: 'Moov' },
    ],
    format: '90 00 00 00',
    length: 8,
    message: 'Numéro invalide. Format attendu : 90 00 00 00',
  },
  '+229': {
    pattern: /^01\d{8}$/,
    operators: [
      { prefix: '0142', name: 'MTN' },
      { prefix: '0146', name: 'MTN' },
      { prefix: '0150', name: 'MTN' },
      { prefix: '0151', name: 'MTN' },
      { prefix: '0152', name: 'MTN' },
      { prefix: '0153', name: 'MTN' },
      { prefix: '0154', name: 'MTN' },
      { prefix: '0156', name: 'MTN' },
      { prefix: '0157', name: 'MTN' },
      { prefix: '0159', name: 'MTN' },
      { prefix: '0161', name: 'MTN' },
      { prefix: '0162', name: 'MTN' },
      { prefix: '0166', name: 'MTN' },
      { prefix: '0167', name: 'MTN' },
      { prefix: '0169', name: 'MTN' },
      { prefix: '0190', name: 'MTN' },
      { prefix: '0191', name: 'MTN' },
      { prefix: '0196', name: 'MTN' },
      { prefix: '0197', name: 'MTN' },
      { prefix: '0145', name: 'Moov' },
      { prefix: '0155', name: 'Moov' },
      { prefix: '0158', name: 'Moov' },
      { prefix: '0160', name: 'Moov' },
      { prefix: '0163', name: 'Moov' },
      { prefix: '0164', name: 'Moov' },
      { prefix: '0165', name: 'Moov' },
      { prefix: '0168', name: 'Moov' },
      { prefix: '0194', name: 'Moov' },
      { prefix: '0195', name: 'Moov' },
      { prefix: '0198', name: 'Moov' },
      { prefix: '0199', name: 'Moov' },
      { prefix: '0120', name: 'Celtiis' },
      { prefix: '0121', name: 'Celtiis' },
      { prefix: '0122', name: 'Celtiis' },
      { prefix: '0123', name: 'Celtiis' },
      { prefix: '0124', name: 'Celtiis' },
      { prefix: '0128', name: 'Celtiis' },
      { prefix: '0129', name: 'Celtiis' },
      { prefix: '0140', name: 'Celtiis' },
      { prefix: '0141', name: 'Celtiis' },
      { prefix: '0143', name: 'Celtiis' },
      { prefix: '0144', name: 'Celtiis' },
      { prefix: '0147', name: 'Celtiis' },
      { prefix: '0148', name: 'Celtiis' },
      { prefix: '0149', name: 'Celtiis' },
      { prefix: '0192', name: 'Celtiis' },
      { prefix: '0193', name: 'Celtiis' },
    ],
    format: '01 60 00 00 00',
    length: 10,
    message: 'Numéro invalide. Format attendu : 01 60 00 00 00',
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
  if (!operator) {
    return {
      valid: false,
      message: `Numéro invalide pour ce pays. Format attendu : ${rule.format}`,
    }
  }
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
