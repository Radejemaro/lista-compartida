export interface ListItem {
  id: string
  name: string
  quantity: number
  bought: number
  checked: boolean
  addedBy: string
  createdAt: number
  position?: number
  note?: string
  price?: number
  updatedAt?: number
  updatedBy?: string
}

export interface ListStore {
  items: ListItem[]
  peerColor: string
}

export type ThemeMode = 'light' | 'dark' | 'high-contrast'

export interface ListMeta {
  id: string
  name: string
  createdAt: number
}
