import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icons'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const {
    products,
    searchQuery,
    setSearchQuery,
    category,
    setCategory,
    setSelectedId,
    setMoveType,
    navigate,
  } = useApp()

  const categories = useMemo(
    () => ['Tous', ...new Set(products.map((p) => p[2]))],
    [products]
  )

  const filtered = useMemo(() => {
    return products
      .map((p, i) => [p, i])
      .filter(([p]) => {
        const matchCat = category === 'Tous' || p[2] === category
        const matchQ = p[0].toLowerCase().includes(searchQuery.toLowerCase())
        return matchCat && matchQ
      })
  }, [products, category, searchQuery])

  return (
    <section className="scr">
      <div className="top">
        <h1>Produits</h1>
        <button
          className="ib"
          onClick={() => {
            setMoveType(1)
            navigate('move')
          }}
          aria-label="Ajouter"
        >
          <Icon name="plus" />
        </button>
      </div>

      <label className="srch">
        <Icon name="search" />
        <input
          type="text"
          placeholder="Rechercher un produit"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Rechercher"
        />
      </label>

      <div className="chips">
        {categories.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? 'on' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="list c2">
        {filtered.length > 0 ? (
          filtered.map(([p, i]) => (
            <ProductCard
              key={i}
              product={p}
              index={i}
              status={p[3] === 0 ? 2 : p[3] <= p[4] ? 1 : 0}
              threshold={p[4]}
              unit={p[5]}
              onClick={() => {
                setSelectedId(i)
                navigate('detail')
              }}
            />
          ))
        ) : (
          <div
            className="card sub"
            style={{ textAlign: 'center', padding: '30px' }}
          >
            Aucun produit trouvé.
          </div>
        )}
      </div>
    </section>
  )
}
