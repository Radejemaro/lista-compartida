import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, Reorder } from 'framer-motion'
import { ListItemRow } from './ListItem'
import { EmptyState } from './EmptyState'
import type { ListItem } from '../types'

interface ShoppingListProps {
  items: ListItem[]
  onToggle: (id: string) => void
  onAdjust: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onReorder: (orderedIds: string[]) => void
}

export function ShoppingList({ items, onToggle, onAdjust, onRemove, onReorder }: ShoppingListProps) {
  // ponytail: localOrder keeps Framer Motion Reorder happy during drags
  const [localOrder, setLocalOrder] = useState(items)
  const [dragging, setDragging] = useState(false)
  const announceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dragging) setLocalOrder(items)
  }, [items, dragging])

  const announce = useCallback((msg: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = msg
    }
  }, [])

  if (items.length === 0) return <EmptyState />

  return (
    <>
      {/* ponytail: live region for screen reader announcements during reorder */}
      <div
        ref={announceRef}
        role="status"
        aria-live="polite"
        className="sr-only"
      />

      <Reorder.Group
        axis="y"
        values={localOrder}
        onReorder={(reordered) => {
          setLocalOrder(reordered)
          setDragging(true)
          onReorder(reordered.map(i => i.id))
        }}
        onDragEnd={() => {
          setDragging(false)
          setLocalOrder(items)
          navigator.vibrate?.(15)
        }}
        aria-roledescription="Lista de compras"
        className="flex flex-col gap-2 px-4 pb-4"
        style={{ listStyle: 'none', padding: 0 }}
      >
        <AnimatePresence mode="popLayout">
          {localOrder.map((item, idx) => (
            <Reorder.Item
              key={item.id}
              value={item}
              exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8,
              }}
              style={{ listStyle: 'none' }}
              whileDrag={{ scale: 1.02, zIndex: 50, cursor: 'grabbing' }}
              onDragEnd={() => announce(`Producto movido a posición ${idx + 1}`)}
            >
              <ListItemRow
                item={item}
                onToggle={onToggle}
                onAdjust={onAdjust}
                onRemove={onRemove}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </>
  )
}
