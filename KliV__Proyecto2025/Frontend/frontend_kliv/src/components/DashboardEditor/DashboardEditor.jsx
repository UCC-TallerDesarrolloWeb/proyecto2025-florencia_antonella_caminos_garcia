import React, { useState, useCallback, useMemo } from "react"

const DashboardEditor = () => {
    const [proyecto] = useState("personal")
    const [zoom, setZoom] = useState(1)
    const [elementos, setElementos] = useState([])

    const tiposDisponibles = useMemo(() => ["chart", "text", "table", "filter", "pdf"], [])

    const agregarElemento = useCallback((tipo) => {
        setElementos(prev => [
            ...prev,
            { id: Date.now(), tipo, proyecto, posicion: { x: 0, y: 0 } }
        ])
    }, [proyecto])

    const eliminarElemento = useCallback((id) => {
        setElementos(prev => prev.filter(el => el.id !== id))
    }, [])

    const ajustarZoom = useCallback((factor) => {
        setZoom(prev => Math.max(0.2, Math.min(prev * factor, 3)))
    }, [])

    const resetZoom = useCallback(() => setZoom(1), [])

    const totalElementos = elementos.length

    return (
        <div className="dashboard-editor">
            <header className="dashboard-header">
                <h1>Dashboard Editor Optimizado</h1>
                <div className="dashboard-info">
                    <span>Proyecto: <strong>{proyecto}</strong></span>
                    <span> | Zoom: <strong>{zoom.toFixed(1)}x</strong></span>
                    <span> | Elementos: <strong>{totalElementos}</strong></span>
                </div>
            </header>

            <main className="dashboard-main">
                <section className="dashboard-controls">
                    <h2>Controles</h2>

                    <div className="control-section">
                        <h3>Agregar Elementos</h3>
                        <div className="control-buttons">
                            {tiposDisponibles.map(tipo => (
                                <button key={tipo} onClick={() => agregarElemento(tipo)}>
                                    + {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="control-section">
                        <h3>Zoom</h3>
                        <div className="control-buttons">
                            <button onClick={() => ajustarZoom(1.2)}>+</button>
                            <button onClick={() => ajustarZoom(0.8)}>-</button>
                            <button onClick={resetZoom}>Reset</button>
                        </div>
                    </div>
                </section>

                <section className="dashboard-view">
                    <h2>Vista del Dashboard</h2>
                    {totalElementos === 0 ? (
                        <p className="empty-msg">No hay elementos aún. Agregá uno para empezar.</p>
                    ) : (
                        <div className="elementos-grid">
                            {elementos.map(({ id, tipo }) => (
                                <div key={id} className="elemento-card">
                                    <span className="elemento-tipo">{tipo}</span>
                                    <button className="eliminar-btn" onClick={() => eliminarElemento(id)}>×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

export default DashboardEditor
