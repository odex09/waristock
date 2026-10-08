import { supabase } from '../lib/supabaseClient'

function getPhoneEmail(countryCode, phone, prefix = 'phone') {
  const dialingCode = String(countryCode).replace(/\D/g, '')
  const phoneNumber = String(phone).replace(/\D/g, '')
  return `${prefix}${dialingCode}${phoneNumber}@waristock.com`
}

export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function signInWithPhone(countryCode, phone, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: getPhoneEmail(countryCode, phone),
    password,
  })

  if (error?.code === 'invalid_credentials') {
    return supabase.auth.signInWithPassword({
      email: getPhoneEmail(countryCode, phone, ''),
      password,
    })
  }

  return { data, error }
}

export async function signUpWithPhone(countryCode, phone, password, shopData) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', phone)
    .eq('country_code', countryCode)
    .maybeSingle()

  if (existing?.id) {
    return { data: null, error: { message: 'Un compte existe déjà avec ce numéro' } }
  }

  const { data, error } = await supabase.auth.signUp({
    email: getPhoneEmail(countryCode, phone),
    password,
  })
  if (error) return { data: null, error }

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      shop_name: shopData.shopName || 'Ma Boutique',
      owner_name: shopData.ownerName || '',
      phone: phone,
      country_code: countryCode,
      currency: shopData.currency || 'XOF',
      city: shopData.city || '',
    })
    if (profileError) {
      return { data: null, error: profileError }
    }
  }

  return { data, error: null }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}
