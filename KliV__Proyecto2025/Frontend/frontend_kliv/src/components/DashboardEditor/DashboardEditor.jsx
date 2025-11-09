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
        <div className="theme-dashboard-editor">
            <header>
                <h1>
                    Dashboard Editor Optimizado
                </h1>
                <div>
                    <span>Proyecto: <strong>{proyecto}</strong></span>
                    <span> | Zoom: <strong>{zoom}x</strong></span>
                    <span> | Elementos: <strong>{elementos.length}</strong></span>
                </div>
            </header>

            <main>
                {/* Controles */}
                <section>
                    <h2>Controles Principales</h2>

                    <fieldset>
                        <legend>Agregar Elementos</legend>
                        <div>
                            {['chart', 'text', 'table', 'filter', 'pdf'].map(tipo => (
                                <button
                                    key={tipo}
                                    onClick={() => agregarElemento(tipo)}
                                >
                                    Agregar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Control de Zoom</legend>
                        <div>
                            <button onClick={() => setZoom(z => z * 1.2)}>Zoom In</button>
                            <button onClick={() => setZoom(z => z * 0.8)}>Zoom Out</button>
                            <button onClick={() => setZoom(1.0)}>Reset Zoom</button>
                        </div>
                    </fieldset>
                </section>

                {/* Vista del Dashboard */}
                <section>
                    <h2>Vista del Dashboard</h2>
                    <div>
                        {elementos.length === 0 ? (
                            <p>Agrega elementos para ver la visualización</p>
                        ) : (
                            <div>
                                {elementos.map(elemento => (
                                    <div key={elemento.id}>
                                        <span>{elemento.tipo}</span>
                                        <button onClick={() => eliminarElemento(elemento.id)}></button>
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