import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useList } from './hooks/useList'
import { HomePage } from './pages/HomePage'
import { ListPage } from './pages/ListPage'

// ponytail: grain texture via SVG filter as data URI — no extra file needed
const GRAIN_OPACITY = 0.025

export default function App() {
  const {
    items,
    loading,
    addItem,
    toggleItem,
    adjustItem,
    removeItem,
    reorderItems,
    peers,
    listId,
    savedLists,
    createList,
    joinList,
    leaveList,
    selectList,
    renameList,
  } = useList()

  // Handle ?join=xxx from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const join = params.get('join')
    if (join && !listId) {
      joinList(join)
      window.history.replaceState({}, '', '/')
    }
  }, [joinList, listId])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--bg-base)]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh bg-[var(--bg-base)] transition-colors duration-[400ms] overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ opacity: GRAIN_OPACITY, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
        />
      </div>
      <main className="relative z-1">
        <AnimatePresence mode="wait">
          {!listId ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <HomePage
                onCreate={createList}
                onJoin={joinList}
                savedLists={savedLists}
                onSelectList={selectList}
                onRenameList={renameList}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <ListPage
                items={items}
                peers={peers}
                listId={listId}
                onAdd={addItem}
                onToggle={toggleItem}
                onAdjust={adjustItem}
                onRemove={removeItem}
                onReorder={reorderItems}
                onLeave={leaveList}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
