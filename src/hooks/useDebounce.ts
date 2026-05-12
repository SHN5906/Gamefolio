import { useState, useEffect } from 'react'

/**
 * Retourne la valeur après `delay` ms d'inactivité.
 * Évite d'appeler l'API à chaque frappe clavier.
 */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
