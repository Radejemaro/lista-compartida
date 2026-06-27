import { useEffect, useState, useCallback, useRef } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { ListItem, ListMeta } from '../types'
import { generateId, peerColor, parseQuantity } from '../lib/utils'

interface UseListReturn {
  items: ListItem[]
  loading: boolean
  addItem: (name: string) => boolean
  toggleItem: (id: string) => void
  adjustItem: (id: string, delta: number) => void
  removeItem: (id: string) => void
  reorderItems: (orderedIds: string[]) => void
  peerColor: string
  peers: number
  listId: string | null
  savedLists: ListMeta[]
  saveCurrentList: (id: string) => void
  createList: () => void
  joinList: (id: string) => void
  leaveList: () => void
  selectList: (id: string) => void
  renameList: (id: string, name: string) => void
  updateItemNote: (id: string, note: string) => void
}

let ydoc: Y.Doc | null = null
let provider: WebrtcProvider | null = null
let yitems: Y.Array<Y.Map<unknown>> | null = null
let persistence: IndexeddbPersistence | null = null

function cleanup() {
  persistence?.destroy()
  provider?.destroy()
  ydoc?.destroy()
  persistence = null
  provider = null
  ydoc = null
  yitems = null
}

function toListItem(m: Y.Map<unknown>): ListItem {
  const name = m.get('name') as string
  const q = (m.get('quantity') as number) ?? parseQuantity(name).quantity
  const b = (m.get('bought') as number) ?? ((m.get('checked') as boolean) ? q : 0)
  const clean = (m.get('quantity') === undefined && m.get('bought') === undefined)
    ? parseQuantity(name).name
    : name
  return {
    id: m.get('id') as string,
    name: clean,
    quantity: q,
    bought: b,
    checked: m.get('checked') as boolean,
    addedBy: m.get('addedBy') as string,
    createdAt: m.get('createdAt') as number,
    position: m.get('position') as number | undefined,
    note: m.get('note') as string | undefined,
    price: m.get('price') as number | undefined,
    updatedAt: m.get('updatedAt') as number | undefined,
    updatedBy: m.get('updatedBy') as string | undefined,
  }
}

function syncItems(): ListItem[] {
  if (!yitems) return []
  return yitems.toArray()
    .map(toListItem)
    .sort((a, b) => (a.position ?? a.createdAt) - (b.position ?? b.createdAt))
}

export function useList(): UseListReturn {
  const [loading, setLoading] = useState(true)
  const [peers, setPeers] = useState(0)
  const [listId, setListId] = useState<string | null>(() => localStorage.getItem('activeListId'))
  const [savedLists, setSavedLists] = useState<ListMeta[]>(() => {
    try { return JSON.parse(localStorage.getItem('lists') || '[]') }
    catch { return [] }
  })
  const [items, setItems] = useState<ListItem[]>([])
  const color = useRef('#4a9e4f')

  useEffect(() => {
    if (!listId) {
      setLoading(false)
      return
    }
    cleanup()

    ydoc = new Y.Doc()
    provider = new WebrtcProvider(listId, ydoc)
    yitems = ydoc.getArray('items')
    persistence = new IndexeddbPersistence(listId, ydoc)

    const onSync = () => {
      setItems(syncItems())
      setLoading(false)
    }

    persistence.on('synced', onSync)
    // ponytail: observe Yjs array directly, update items on every change.
    // Observer fires synchronously for local mutations and asynchronously for remote.
    const onYChange = () => setItems(syncItems())
    // ponytail: observeDeep watches nested Y.Map changes (toggle, adjust, note edits)
    yitems.observeDeep(onYChange)

    provider.on('peers', ({ webrtcPeers }: { webrtcPeers: unknown[] }) => {
      setPeers(webrtcPeers.length)
    })

    color.current = peerColor(ydoc.clientID.toString())
    setItems(syncItems())

    return () => {
      try { yitems?.unobserveDeep(onYChange) } catch { /* already destroyed */ }
      cleanup()
    }
  }, [listId])

  const addItem = useCallback((name: string): boolean => {
    if (!yitems || !name.trim()) return false
    const { name: clean, quantity } = parseQuantity(name.trim())

    // ponytail: O(n) scan for duplicates. Use a Set for O(1) if lists grow past 500.
    const duplicate = yitems.toArray().some(m => {
      const existing = (m.get('name') as string)?.toLowerCase()
      return existing === clean.toLowerCase()
    })
    if (duplicate) return false

    const map = new Y.Map<unknown>()
    map.set('id', generateId())
    map.set('name', clean)
    map.set('quantity', quantity)
    map.set('bought', 0)
    map.set('checked', false)
    map.set('addedBy', ydoc!.clientID.toString())
    map.set('createdAt', Date.now())
    yitems.push([map])
    return true
  }, [])

  const toggleItem = useCallback((id: string) => {
    if (!yitems) return
    yitems.forEach(m => {
      if (m.get('id') === id) {
        const checked = !(m.get('checked') as boolean)
        const qty = (m.get('quantity') as number) || 1
        m.set('checked', checked)
        m.set('bought', checked ? qty : 0)
        m.set('updatedAt', Date.now())
        m.set('updatedBy', ydoc!.clientID.toString())
      }
    })
  }, [])

  const adjustItem = useCallback((id: string, delta: number) => {
    if (!yitems) return
    yitems.forEach(m => {
      if (m.get('id') === id) {
        const qty = (m.get('quantity') as number) || 1
        const bought = Math.max(0, ((m.get('bought') as number) || 0) + delta)
        m.set('bought', bought)
        m.set('checked', bought >= qty)
        m.set('updatedAt', Date.now())
        m.set('updatedBy', ydoc!.clientID.toString())
      }
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    if (!yitems) return
    let idx = -1
    yitems.forEach((m, i) => {
      if (m.get('id') === id) idx = i
    })
    if (idx >= 0) yitems.delete(idx, 1)
  }, [])

  const reorderItems = useCallback((orderedIds: string[]) => {
    if (!yitems) return
    orderedIds.forEach((id, position) => {
      yitems!.forEach(m => {
        if (m.get('id') === id) m.set('position', position)
      })
    })
  }, [])

  const saveCurrentList = useCallback((id: string) => {
    const lists: ListMeta[] = JSON.parse(localStorage.getItem('lists') || '[]')
    if (!lists.find(l => l.id === id)) {
      lists.push({ id, name: `Lista ${id.slice(0, 4)}`, createdAt: Date.now() })
      localStorage.setItem('lists', JSON.stringify(lists))
      setSavedLists(lists)
    }
    localStorage.setItem('activeListId', id)
    setListId(id)
  }, [])

  const createList = useCallback(() => {
    const id = generateId().slice(0, 8)
    saveCurrentList(id)
  }, [saveCurrentList])

  const joinList = useCallback((id: string) => {
    saveCurrentList(id)
  }, [saveCurrentList])

  const leaveList = useCallback(() => {
    cleanup()
    localStorage.removeItem('activeListId')
    setListId(null)
    setItems([])
    setLoading(false)
    setPeers(0)
  }, [])

  const selectList = useCallback((id: string) => {
    localStorage.setItem('activeListId', id)
    setListId(id)
  }, [])

  const renameList = useCallback((id: string, name: string) => {
    const lists: ListMeta[] = JSON.parse(localStorage.getItem('lists') || '[]')
    const idx = lists.findIndex(l => l.id === id)
    if (idx >= 0) {
      lists[idx] = { ...lists[idx], name }
      localStorage.setItem('lists', JSON.stringify(lists))
      setSavedLists(lists)
    }
  }, [])

  const updateItemNote = useCallback((id: string, note: string) => {
    if (!yitems) return
    yitems.forEach(m => {
      if (m.get('id') === id) {
        if (note) m.set('note', note)
        else m.delete('note')
        m.set('updatedAt', Date.now())
        m.set('updatedBy', ydoc!.clientID.toString())
      }
    })
  }, [])

  return {
    items,
    loading,
    addItem,
    toggleItem,
    adjustItem,
    removeItem,
    reorderItems,
    peerColor: color.current,
    peers,
    listId,
    savedLists,
    saveCurrentList,
    createList,
    joinList,
    leaveList,
    selectList,
    renameList,
    updateItemNote,
  }
}
