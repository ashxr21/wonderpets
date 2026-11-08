export const money = (n) =>
    Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

// The price in force on a given dqate = Latest effective date on or before it
export function priceFor(prices, prodCode, date){
    const hit = prices
    .filter((p) => !p.isDeleted && p.prodCode === prodCode && p.effDate <= date)
    .sort((a, b) => b.effDate.localeCompare(a.effDate))[0]
    return hit ? Number(hit.unitPrice) : null
}

//Active sales, easch with its Line items and total
export function computeSales(sales, details, prices){
    return sales
    .filter((s) => !s.isDeleted)
    .map((sale) => {
        const lines = details.filter((line) => !line.isDeleted && line.transNo === sale.transNo)
        .map((line) => {
            const unitPrice = priceFor(prices, line.prodCode, sale.salesDate) ?? 0
            const qty = Number(line.qty)
            return { prodCode: line.prodCode, qty, unitPrice, amount: unitPrice * qty }
        })
        return { ...sale, lines, total: lines.reduce((t, l) => t + l.amount, 0) }
    })
}