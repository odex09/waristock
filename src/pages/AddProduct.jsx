import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'
import { removeProductImage, uploadProductImage } from '../services/upload'
import { COUNTRY_CODES, PHONE_RULES, validatePhone } from '../lib/phone'

const CATEGORIES = [
  'Céréales',
  'Huiles',
  'Épicerie',
  'Conserves',
  'Boissons',
  'Hygiène',
]

export default function AddProduct() {
  const { suppliers, addProduct, addSupplier, showToast, navigate, auth } = useApp()
  const [form, setForm] = useState({
    name: '',
    category: '',
    stock: 0,
    threshold: 5,
    unit: 'sacs',
    buyPrice: '',
    sellPrice: '',
    supplierId: '',
  })
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    categories: '',
    phone: '',
  })
  const [supplierCountryCode, setSupplierCountryCode] = useState('+228')
  const [productImage, setProductImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!productImage) {
      setImagePreview('')
      return undefined
    }

    const previewUrl = URL.createObjectURL(productImage)
    setImagePreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [productImage])

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const updateSupplierPhone = (value) => {
    const maxLength = PHONE_RULES[supplierCountryCode]?.length || 0
    setNewSupplier((supplier) => ({
      ...supplier,
      phone: value.replace(/\D/g, '').slice(0, maxLength),
    }))
  }

  const save = async () => {
    if (!form.name.trim()) {
      showToast('Nom du produit requis')
      return
    }

    if (!auth.user?.id) {
      showToast('Votre session a expiré. Reconnectez-vous puis réessayez.')
      return
    }

    const supportedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (productImage && (!supportedImageTypes.includes(productImage.type) || productImage.size > 5 * 1024 * 1024)) {
      showToast('Choisissez une image JPG, PNG ou WebP de 5 Mo maximum')
      return
    }
    let supplierPhone = ''
    if (form.supplierId === '__new__') {
      if (!newSupplier.name.trim()) {
        showToast('Nom du fournisseur requis')
        return
      }
      const validation = validatePhone(supplierCountryCode, newSupplier.phone)
      if (!validation.valid) {
        showToast(validation.message)
        return
      }
      supplierPhone = `${supplierCountryCode}${newSupplier.phone}`
    }

    setSaving(true)
    let uploadedImagePath = null
    try {
      let supplierId = form.supplierId
      let supplierIndex = suppliers.findIndex((supplier) => supplier[3] === supplierId)
      if (supplierId === '__new__') {
        const { data, error } = await addSupplier([
          newSupplier.name.trim(),
          newSupplier.categories.trim(),
          supplierPhone,
        ])
        if (error) {
          showToast(error.message || 'Impossible d’ajouter le fournisseur')
          return
        }
        supplierId = data[3]
        supplierIndex = suppliers.length
      }

      let image = '/favicon.svg'
      if (productImage) {
        const { data, error } = await uploadProductImage(
          productImage,
          auth.user.id,
          `${crypto.randomUUID()}.webp`
        )
        if (error) {
          showToast(error.message || 'Impossible de téléverser la photo')
          return
        }
        image = data.path
        uploadedImagePath = data.path
      }

      const { error, imageError } = await addProduct({
        name: form.name.trim(),
        image,
        category: form.category || CATEGORIES[0],
        stock: Number(form.stock) || 0,
        threshold: Number(form.threshold) || 0,
        unit: form.unit || 'sacs',
        buyPrice: Number(form.buyPrice) || 0,
        sellPrice: Number(form.sellPrice) || 0,
        supplierId,
        supplierIndex,
      })
      if (error) {
        let message = error.message || 'Impossible d’enregistrer le produit'
        if (uploadedImagePath) {
          const { error: cleanupError } = await removeProductImage(uploadedImagePath)
          if (cleanupError) {
            message += ` La photo temporaire n’a pas pu être supprimée : ${cleanupError.message}`
          } else {
            uploadedImagePath = null
          }
        }
        showToast(message)
        return
      }
      uploadedImagePath = null
      showToast(
        imageError
          ? `Produit ajouté, mais la photo n’a pas pu être affichée : ${imageError.message}`
          : 'Produit créé avec succès ✓'
      )
      navigate('products')
    } catch (error) {
      let message = error.message || 'Une erreur est survenue pendant l’enregistrement'
      if (uploadedImagePath) {
        const { error: cleanupError } = await removeProductImage(uploadedImagePath)
        if (cleanupError) {
          message += ` La photo temporaire n’a pas pu être supprimée : ${cleanupError.message}`
        }
      }
      showToast(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="scr n">
      <div className="top">
        <div className="row">
          <button
            className="ib"
            onClick={() => navigate('home')}
            aria-label="Retour"
          >
            <Icon name="back" />
          </button>
          <h1 style={{ fontSize: '22px' }}>
            Nouveau produit
          </h1>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '18px',
            marginBottom: 14,
          }}
        >
          <img
            src={imagePreview || '/favicon.svg'}
            alt={productImage ? 'Aperçu de la photo du produit' : 'Logo WariStock par défaut'}
            style={{
              width: 88,
              height: 88,
              borderRadius: 16,
              objectFit: 'cover',
              display: 'inline-block',
            }}
          />
          <p className="sub" style={{ marginTop: 8 }}>
            {productImage ? productImage.name : 'Logo WariStock par défaut'}
          </p>
          <label className="btn o s" style={{ display: 'inline-flex', marginTop: 8, cursor: 'pointer' }}>
            Choisir une photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setProductImage(event.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
          </label>
          <p className="sub" style={{ marginTop: 8 }}>
            La photo est redimensionnée et compressée en WebP avant son envoi.
          </p>
        </div>

        <label className="fld">
          <span>Nom du produit</span>
          <input
            type="text"
            maxLength={120}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ex: Riz parfumé 25 kg"
          />
        </label>

        <label className="fld">
          <span>Catégorie</span>
          <input
            type="text"
            maxLength={80}
            list="categories"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            placeholder="Choisir ou saisir une catégorie"
          />
          <datalist id="categories">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <div className="g2">
          <label className="fld">
            <span>Stock initial</span>
            <input
              type="number"
              inputMode="numeric"
              value={form.stock}
              onChange={(e) => update('stock', e.target.value)}
            />
          </label>
          <label className="fld">
            <span>Seuil alerte</span>
            <input
              type="number"
              inputMode="numeric"
              value={form.threshold}
              onChange={(e) => update('threshold', e.target.value)}
            />
          </label>
        </div>

        <label className="fld">
          <span>Unité</span>
          <input
            type="text"
            maxLength={32}
            value={form.unit}
            onChange={(e) => update('unit', e.target.value)}
            placeholder="Ex: sacs, bidons, cartons"
          />
        </label>

        <div className="g2">
          <label className="fld">
            <span>Prix d'achat (FCFA)</span>
            <input
              type="number"
              inputMode="numeric"
              value={form.buyPrice}
              onChange={(e) => update('buyPrice', e.target.value)}
            />
          </label>
          <label className="fld">
            <span>Prix de vente (FCFA)</span>
            <input
              type="number"
              inputMode="numeric"
              value={form.sellPrice}
              onChange={(e) => update('sellPrice', e.target.value)}
            />
          </label>
        </div>

        <label className="fld">
          <span>Fournisseur</span>
          <select
            value={form.supplierId}
            onChange={(e) => update('supplierId', e.target.value)}
          >
            <option value="">Sélectionner ou saisir un fournisseur</option>
            {suppliers.map((s) => (
              <option key={s[3]} value={s[3]}>
                {s[0]}
              </option>
            ))}
            <option value="__new__">
              + Nouveau fournisseur
            </option>
          </select>
        </label>

        {form.supplierId === '__new__' && (
          <div className="card" style={{ padding: 14, marginBottom: 14 }}>
            <label className="fld" style={{ marginBottom: 10 }}>
              <span>Nom du fournisseur</span>
              <input
                type="text"
                maxLength={120}
                value={newSupplier.name}
                onChange={(e) =>
                  setNewSupplier((s) => ({ ...s, name: e.target.value }))
                }
                placeholder="Ex: Grossiste Adjamé & Fils"
              />
            </label>
            <label className="fld" style={{ marginBottom: 10 }}>
              <span>Catégories</span>
              <input
                type="text"
                maxLength={255}
                value={newSupplier.categories}
                onChange={(e) =>
                  setNewSupplier((s) => ({ ...s, categories: e.target.value }))
                }
                placeholder="Ex: Céréales, sucre"
              />
            </label>
            <label className="fld" style={{ margin: 0 }}>
              <span>WhatsApp / Téléphone</span>
              <div className="ph">
                <select
                  aria-label="Indicatif du fournisseur"
                  value={supplierCountryCode}
                  onChange={(event) => {
                    setSupplierCountryCode(event.target.value)
                    setNewSupplier((supplier) => ({ ...supplier, phone: '' }))
                  }}
                >
                  {COUNTRY_CODES.filter((country) => country.enabled).map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={newSupplier.phone}
                  onChange={(event) => updateSupplierPhone(event.target.value)}
                  placeholder={PHONE_RULES[supplierCountryCode]?.format || 'Numéro'}
                  aria-label="Numéro de téléphone du fournisseur"
                />
              </div>
              <small className="sub">
                {COUNTRY_CODES.find((country) => country.code === supplierCountryCode)?.country}
                {' · Format : '}
                {PHONE_RULES[supplierCountryCode]?.format}
              </small>
            </label>
          </div>
        )}

        <button
          className="btn f"
          type="submit"
          style={{ marginTop: 8 }}
          disabled={saving}
        >
          {saving ? 'Enregistrement...' : 'Ajouter le produit'}
        </button>
      </form>
    </section>
  )
}
