import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'

const PERIODS = ['Semaine', 'Mois', 'Année']
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getReportBuckets(period, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (period === 0) {
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    return WEEKDAYS.map((label, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return { key: dateKey(date), label, active: dateKey(date) === dateKey(today) }
    })
  }

  if (period === 1) {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, index) => ({
      key: index + 1,
      label: `S${index + 1}`,
      active: Math.floor((today.getDate() - 1) / 7) === index,
    }))
  }

  return MONTHS.map((label, index) => ({
    key: index,
    label,
    active: index === now.getMonth(),
  }))
}

function getBucketIndex(period, date) {
  if (period === 0) {
    const weekday = (date.getDay() + 6) % 7
    return weekday
  }
  if (period === 1) return Math.floor((date.getDate() - 1) / 7)
  return date.getMonth()
}

const formatAmount = (amount) =>
  `${Math.round(amount).toLocaleString('fr-FR')} FCFA`

export default function Reports() {
  const { period, setPeriod, products, movements, loading } = useApp()
  const [reportDate] = useState(() => new Date())
  const safePeriod = PERIODS[period] ? period : 0

  const report = useMemo(() => {
    const now = reportDate
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    const buckets = getReportBuckets(safePeriod, now).map((bucket) => ({
      ...bucket,
      sales: 0,
    }))
    const topProducts = new Map()
    let sales = 0
    let grossMargin = 0

    for (const movement of movements) {
      if (movement[0] !== 0 || movement[1] < 0) continue

      const product = products[movement[1]]
      const dateText = movement[8]
      if (!product || !dateText) continue

      const dateParts = dateText.slice(0, 10).split('-').map(Number)
      if (dateParts.length !== 3 || dateParts.some(Number.isNaN)) continue
      const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
      if (safePeriod === 0) {
        if (Number.isNaN(date.getTime()) || date < weekStart || date >= weekEnd) continue
      } else if (
        Number.isNaN(date.getTime()) ||
        date.getFullYear() !== now.getFullYear() ||
        (safePeriod === 1 && date.getMonth() !== now.getMonth())
      ) {
        continue
      }

      const quantity = Number(movement[2]) || 0
      const amount = quantity * (Number(product[7]) || 0)
      const margin = quantity * ((Number(product[7]) || 0) - (Number(product[6]) || 0))
      const bucketIndex = getBucketIndex(safePeriod, date)
      if (!buckets[bucketIndex]) continue

      sales += amount
      grossMargin += margin
      buckets[bucketIndex].sales += amount

      const current = topProducts.get(product[9]) || {
        product,
        quantity: 0,
        sales: 0,
      }
      current.quantity += quantity
      current.sales += amount
      topProducts.set(product[9], current)
    }

    const bestSellers = [...topProducts.values()]
      .sort((a, b) => b.quantity - a.quantity || b.sales - a.sales)
      .slice(0, 4)

    return {
      sales,
      grossMargin,
      buckets,
      bestSellers,
      maxBucketSales: Math.max(...buckets.map((bucket) => bucket.sales), 0),
      hasSales: topProducts.size > 0,
    }
  }, [movements, products, reportDate, safePeriod])

  return (
    <section className="scr">
      <div className="top">
        <div>
          <h1>Rapports</h1>
          <p className="sub">Vos ventes et vos marges</p>
        </div>
      </div>

      <div className="seg">
        {PERIODS.map((label, index) => (
          <button
            key={label}
            className={safePeriod === index ? 'on' : ''}
            aria-pressed={safePeriod === index}
            onClick={() => setPeriod(index)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="g2" style={{ marginBottom: '12px' }}>
        <div className="card">
          <span className="sub">Ventes</span>
          <b>{loading ? 'Chargement…' : formatAmount(report.sales)}</b>
          <span className="sub">Sorties de stock sur la période</span>
        </div>
        <div className="card">
          <span className="sub">Marge brute estimée</span>
          <b>{loading ? 'Chargement…' : formatAmount(report.grossMargin)}</b>
          <span className="sub">Calculée avec les prix actuels</span>
        </div>
      </div>

      <div className="two">
        <div className="card">
          <h2 style={{ fontSize: '17px' }}>Évolution des ventes</h2>
          <div
            className="bars"
            role="img"
            aria-label={`Ventes par ${safePeriod === 0 ? 'jour' : safePeriod === 1 ? 'semaine' : 'mois'}`}
          >
            {report.buckets.map((bucket) => {
              const height = report.maxBucketSales
                ? Math.max(4, (bucket.sales / report.maxBucketSales) * 100)
                : 0
              return (
                <div
                  key={bucket.key}
                  className={bucket.active ? 'on' : ''}
                  style={{ height: `${height}%` }}
                  title={`${bucket.label} : ${formatAmount(bucket.sales)}`}
                />
              )
            })}
          </div>
          <div className="bl">
            {report.buckets.map((bucket) => (
              <span key={bucket.key}>{bucket.label}</span>
            ))}
          </div>
          {!loading && !report.hasSales && (
            <p className="sub" style={{ marginTop: '12px', textAlign: 'center' }}>
              Aucune vente enregistrée sur cette période.
            </p>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '17px', marginBottom: '10px' }}>
            Produits les plus vendus
          </h2>
          {loading ? (
            <p className="sub">Chargement des ventes…</p>
          ) : report.bestSellers.length > 0 ? (
            report.bestSellers.map(({ product, quantity, sales }) => {
              const maxQuantity = report.bestSellers[0].quantity
              return (
                <div key={product[9]} className="mv">
                  <div
                    className="th"
                    style={{
                      width: '40px',
                      height: '40px',
                      fontSize: '20px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    {product[1]?.startsWith('/') || product[1]?.startsWith('http') ? (
                      <img
                        src={product[1]}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      product[1]
                    )}
                  </div>
                  <div>
                    <b style={{ fontSize: '14px' }}>{product[0]}</b>
                    <span className="sub">
                      {quantity} {product[5]} · {formatAmount(sales)}
                    </span>
                    <div className="bar">
                      <div style={{ width: `${(quantity / maxQuantity) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="sub">Aucune vente enregistrée sur cette période.</p>
          )}
        </div>
      </div>
    </section>
  )
}
