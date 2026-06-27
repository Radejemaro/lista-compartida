const COLORS = [
  '#4a9e4f', '#e67e22', '#3498db', '#e74c3c',
  '#9b59b6', '#1abc9c', '#f39c12', '#2ecc71',
]

export function peerColor(peerId: string): string {
  let hash = 0
  for (let i = 0; i < peerId.length; i++) {
    hash = peerId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ponytail: parse leading number + rest. "5 lechugas" → { name: "lechugas", quantity: 5 }
export function parseQuantity(raw: string): { name: string; quantity: number } {
  const match = raw.trim().match(/^(\d+)\s+(.+)/)
  if (match) {
    const q = parseInt(match[1], 10)
    return { name: match[2], quantity: q > 0 ? q : 1 }
  }
  return { name: raw.trim(), quantity: 1 }
}
