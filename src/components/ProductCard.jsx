import { getRoutePath } from '../lib/routes'

export default function ProductCard({
  product,
  onClick,
}) {
  const stockPercentage = product[3] <= 0
    ? 0
    : product[4] <= 0
      ? 100
      : Math.min(100, Math.round((product[3] / (product[4] * 2)) * 100))

  const F = (n) =>
    Math.round(n).toLocaleString('fr-FR').replace(/\u202f/g, ' ')

  return (
    <a
      className={`card pr ${product[3] === 0 ? 'al r' : product[3] <= product[4] ? 'al' : ''}`}
      href={getRoutePath('detail')}
      onClick={(e) => {
        e.preventDefault()
        if (onClick) onClick()
      }}
    >
      <div className="th">
        {product[1]?.startsWith('/') || product[1]?.startsWith('http') ? (
          <img
            src={product[1]}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
          />
        ) : (
          product[1]
        )}
      </div>
      <div>
        <b>{product[0]}</b>
        <span className="sub">
          {product[2]} · {F(product[7])} FCFA
        </span>
        <div
          className="bar"
          role="progressbar"
          aria-label={`Niveau de stock de ${product[0]}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={stockPercentage}
        >
          <div
            style={{
              width: `${stockPercentage}%`,
            }}
          />
        </div>
      </div>
      <div className="qt">
        <b>{product[3]}</b>
        <span>{product[5]}</span>
      </div>
    </a>
  )
}
