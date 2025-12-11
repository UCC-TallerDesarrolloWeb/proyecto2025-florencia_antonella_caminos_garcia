import React from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'

export default function LoadingSpinner() {
    const { themeName } = useTheme()

    return (
        <div className="loading-container" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: themeName === 'dark' ? '#0f172a' : '#ffffff'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: `4px solid ${themeName === 'dark' ? '#374151' : '#e5e7eb'}`,
                borderTopColor: '#7c3aed',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '20px', color: themeName === 'dark' ? '#cbd5e1' : '#4b5563' }}>
                Cargando...
            </p>
        </div>
    )
}