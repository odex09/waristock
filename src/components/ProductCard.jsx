import { useCallback } from 'react'

const cls = ['', 'w', 'r']

export default function ProductCard({
  product,
  onClick,
}) {
  const lv = useCallback(
    (p) => Math.min(100, Math.round((p[3] / (p[4] * 2)) * 100)),
    []
  )

  const F = (n) =>
    Math.round(n).toLocaleString('fr-FR').replace(/\u202f/g, ' ')

  return (
    <a
      className={`card pr ${product[3] === 0 ? 'al r' : product[3] <= product[4] ? 'al' : ''}`}
      href="#/detail"
      onClick={(e) => {
        e.preventDefault()
        if (onClick) onClick()
      }}
    >
      <div className="th">{product[1]}</div>
      <div>
        <b>{product[0]}</b>
        <span className="sub">
          {product[2]} · {F(product[7])} FCFA
        </span>
        <div className={`bar ${cls[product[3] === 0 ? 2 : product[3] <= product[4] ? 1 : 0]}`}>
          <div
            style={{
              width: `${Math.max(4, lv(product))}%`,
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
