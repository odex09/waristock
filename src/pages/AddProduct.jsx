import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'

const CATEGORIES = [
  'Céréales',
  'Huiles',
  'Épicerie',
  'Conserves',
  'Boissons',
  'Hygiène',
]

export default function AddProduct() {
  const { suppliers, addProduct, addSupplier, showToast, navigate } = useApp()
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

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const save = () => {
    if (!form.name.trim()) {
      showToast('Nom du produit requis')
      return
    }

    let supplierId = form.supplierId
    if (supplierId === '__new__') {
      if (!newSupplier.name.trim() || !newSupplier.phone.trim()) {
        showToast('Nom et téléphone du fournisseur requis')
        return
      }
      const created = [
        newSupplier.name.trim(),
        newSupplier.categories.trim(),
        newSupplier.phone.trim(),
      ]
      addSupplier(created)
      supplierId = String(suppliers.length)
    }

    addProduct({
      name: form.name.trim(),
      emoji: '',
      category: form.category || CATEGORIES[0],
      stock: Number(form.stock) || 0,
      threshold: Number(form.threshold) || 0,
      unit: form.unit || 'sacs',
      buyPrice: Number(form.buyPrice) || 0,
      sellPrice: Number(form.sellPrice) || 0,
      supplierId: Number(supplierId),
    })
    showToast('Produit ajouté ✓')
    navigate('products')
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
            src="/favicon.svg"
            alt="WariStock"
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              display: 'inline-block',
            }}
          />
          <p className="sub" style={{ marginTop: 8 }}>
            Logo du produit
          </p>
        </div>

        <label className="fld">
          <span>Nom du produit</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ex: Riz parfumé 25 kg"
          />
        </label>

        <label className="fld">
          <span>Catégorie</span>
          <input
            type="text"
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
            <option value="">Sélectionner un fournisseur</option>
            {suppliers.map((s, i) => (
              <option key={i} value={String(i)}>
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
                value={newSupplier.categories}
                onChange={(e) =>
                  setNewSupplier((s) => ({ ...s, categories: e.target.value }))
                }
                placeholder="Ex: Céréales, sucre"
              />
            </label>
            <label className="fld" style={{ margin: 0 }}>
              <span>WhatsApp / Téléphone</span>
              <input
                type="tel"
                inputMode="numeric"
                value={newSupplier.phone}
                onChange={(e) =>
                  setNewSupplier((s) => ({ ...s, phone: e.target.value }))
                }
                placeholder="Ex: +22890123456"
              />
            </label>
          </div>
        )}

        <button
          className="btn f"
          type="submit"
          style={{ marginTop: 8 }}
        >
          Ajouter le produit
        </button>
      </form>
    </section>
  )
}
