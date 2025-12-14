import { useTheme } from '@/contexts/ThemeContext'

export default function LoadingSpinner() {
    const { themeName } = useTheme()

    return (
        <div className={`loading-container ${themeName}`}>
            <div className="spinner"></div>
            <p className="loading-text">Cargando...</p>
        </div>
    )
}