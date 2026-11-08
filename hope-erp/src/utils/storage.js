// REad-only peek at LocalStorage (used by Sales and Reports to Look up other modules' data)
export function readStore(key, fallback){
    try{
        const s = localStorage.getItem(key)
        return s ? JSON.parse(s) : fallback
    } catch {
        return fallback
    }
}