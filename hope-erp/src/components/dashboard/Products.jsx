import { useState } from 'react'
import { useERPCollection } from '../../hooks/useERPData'
import { KEYS } from '../../data/defaults'
import RecordManager from '../ui/RecordManager'
import ActionButton from '../ui/ActionButton'
import Modal from '../ui/Modal'

const productFields = [
  { name: 'prodCode', label: 'Product Code', short: 'Prod Code', placeholder: 'e.g. P-001', readOnlyOnEdit: true },
  { name: 'description', label: 'Description', placeholder: 'Product description' },
  { name: 'unit', label: 'Unit', placeholder: 'e.g. pcs, box' },
]

const priceFields = [
  { name: 'prodCode', label: 'Product Code', hideInTable: true },
  { name: 'effDate', label: 'Effective Date', short: 'Effective', type: 'date', readOnlyOnEdit: true },
  { name: 'unitPrice', label: 'Unit Price', type: 'number', money: true, step: '0.01', min: 0, placeholder: '0.00' },
]

export default function Products() {
  const [products, setProducts] = useERPCollection(KEYS.products)
  const [prices, setPrices] = useERPCollection(KEYS.prices)
  const [priceFor, setPriceFor] = useState(null) // product whose price history is open

  return (
    <>
      <RecordManager
        title="Product Management" singular="Product"
        records={products} setRecords={setProducts}
        fields={productFields} keyOf={(r) => r.prodCode}
        perms={{ add: 'products.add', edit: 'products.edit', delete: 'products.delete' }}
        extraActions={(r) => <ActionButton onClick={() => setPriceFor(r)}>Prices</ActionButton>}
      />

      <Modal
        open={!!priceFor} onClose={() => setPriceFor(null)} size="xl"
        title={priceFor ? `Price History – ${priceFor.prodCode}` : ''}
        subtitle={priceFor ? priceFor.description : ''}
      >
        {priceFor && (
          <RecordManager
            singular="Price"
            records={prices} setRecords={setPrices}
            fields={priceFields} keyOf={(r) => `${r.prodCode}|${r.effDate}`}
            perms={{ add: 'products.priceAdd', edit: 'products.priceEdit', delete: 'products.priceDelete' }}
            scope={(r) => r.prodCode === priceFor.prodCode}
            fixed={{ prodCode: priceFor.prodCode }}
            sort={(a, b) => b.effDate.localeCompare(a.effDate)}
          />
        )}
      </Modal>
    </>
  )
}
