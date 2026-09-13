import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginSignup } from './LoginSignup'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (user: any) => void
  defaultIsLogin?: boolean
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultIsLogin = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <LoginSignup
              onSuccess={(user) => {
                if (onSuccess) onSuccess(user)
                onClose()
              }}
              onClose={onClose}
              defaultIsLogin={defaultIsLogin}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
