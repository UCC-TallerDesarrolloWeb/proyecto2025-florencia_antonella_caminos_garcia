import React, { useState } from 'react'

const DashboardEditor = () => {
    const [proyecto] = useState('personal')
    const [zoom, setZoom] = useState(1.0)
    const [elementos, setElementos] = useState([])

    const agregarElemento = (tipo) => {
        const nuevoElemento = {
            id: Date.now(),
            tipo,
            proyecto,
            posicion: { x: 0, y: 0 }
        }
        setElementos(prev => [...prev, nuevoElemento])
    }

    const eliminarElemento = (id) => {
        setElementos(prev => prev.filter(el => el.id !== id))
    }

    return (
        <div className="theme-dashboard-editor" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
            <header style={{ background: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '12px', marginBottom: '20px', backdropFilter: 'blur(10px)' }}>
                <h1 style={{ margin: '0 0 10px 0', background: 'linear-gradient(135deg, #0284c7, #0369a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Dashboard Editor Optimizado
                </h1>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <span>Proyecto: <strong>{proyecto}</strong></span>
                    <span> | Zoom: <strong>{zoom}x</strong></span>
                    <span> | Elementos: <strong>{elementos.length}</strong></span>
                </div>
            </header>

            <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Controles */}
                <section style={{ background: 'rgba(255,255,255,0.95)', padding: '24px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                    <h2 style={{ color: '#0369a1', borderBottom: '2px solid #bae6fd', paddingBottom: '8px', marginBottom: '20px' }}>Controles Principales</h2>

                    <fieldset style={{ border: '2px solid #e0f2fe', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                        <legend style={{ fontWeight: '600', color: '#0284c7', padding: '0 10px' }}>Agregar Elementos</legend>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {['chart', 'text', 'table', 'filter', 'pdf'].map(tipo => (
                                <button
                                    key={tipo}
                                    onClick={() => agregarElemento(tipo)}
                                    style={{
                                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Agregar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset style={{ border: '2px solid #e0f2fe', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                        <legend style={{ fontWeight: '600', color: '#0284c7', padding: '0 10px' }}>Control de Zoom</legend>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={() => setZoom(z => z * 1.2)}>Zoom In</button>
                            <button onClick={() => setZoom(z => z * 0.8)}>Zoom Out</button>
                            <button onClick={() => setZoom(1.0)}>Reset Zoom</button>
                        </div>
                    </fieldset>
                </section>

                {/* Vista del Dashboard */}
                <section style={{ background: 'rgba(255,255,255,0.95)', padding: '24px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
                    <h2 style={{ color: '#0369a1', borderBottom: '2px solid #bae6fd', paddingBottom: '8px', marginBottom: '20px' }}>Vista del Dashboard</h2>
                    <div style={{
                        background: '#f8fafc',
                        padding: '20px',
                        borderRadius: '12px',
                        minHeight: '400px',
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left'
                    }}>
                        {elementos.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#64748b' }}>Agrega elementos para ver la visualización</p>
                        ) : (
                            <div style={{ position: 'relative', height: '400px' }}>
                                {elementos.map(elemento => (
                                    <div
                                        key={elemento.id}
                                        style={{
                                            position: 'absolute',
                                            left: elemento.posicion.x,
                                            top: elemento.posicion.y,
                                            background: 'white',
                                            padding: '10px',
                                            border: '2px solid #0ea5e9',
                                            borderRadius: '8px',
                                            cursor: 'move'
                                        }}
                                    >
                                        <span>{elemento.tipo}</span>
                                        <button
                                            onClick={() => eliminarElemento(elemento.id)}
                                            style={{
                                                marginLeft: '10px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}

export default DashboardEditor