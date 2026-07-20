import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key)
            // Parse if exists, otherwise use initialValue
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(`Error reading from localStorage [${key}]:`, error)
            return initialValue
        }
    })
    // Save to localStorage whenever value changes
    const setValue = (value: T) => {
        try {
            setStoredValue(value)
            localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error(`Error writing to localStorage [${key}]:`, error)
        }
    }
    // Sync across tabs/windows
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === key && event.newValue) {
                try {
                    setStoredValue(JSON.parse(event.newValue))
                } catch (error) {
                    console.error(`Error syncing localStorage [${key}]:`, error)
                }
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [key])

    return [storedValue, setValue]
}