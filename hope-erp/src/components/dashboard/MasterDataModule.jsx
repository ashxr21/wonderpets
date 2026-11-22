import { useERPCollection } from '../../hooks/useERPData'
import RecordManager from '../ui/RecordManager'

export default function MasterDataModule({
  title, singular, permPrefix, storageKey, fields, keyField, kpis,
}) {
  const [records, setRecords] = useERPCollection(storageKey)

  return (
    <RecordManager
      title={title}
      singular={singular}
      records={records}
      setRecords={setRecords}
      storageKey={storageKey}
      fields={fields}
      keyOf={(record) => record[keyField]}
      perms={{
        add: `${permPrefix}.add`,
        edit: `${permPrefix}.edit`,
        delete: `${permPrefix}.delete`,
      }}
      kpis={kpis}
    />
  )
}
