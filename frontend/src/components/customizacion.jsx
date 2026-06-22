"use client";

import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import './customizacion.css';

const colores = [
    { id: "indigo", nombre: 'Índigo', hex: "#6366f1", hexClaro: "#818cf8" },
    { id: 'violet', nombre: 'Violeta', hex: "#8b5cf6", hexClaro: "#a78bfa" },
    { id: 'emerald', nombre: 'Esmeralda', hex: "#10b981", hexClaro: "#34d399" },
    { id: 'rose', nombre: 'Rosa Neón', hex: "#f43f5e", hexClaro: "#fb7185" },
    { id: 'amber', nombre: 'Ámbar', hex: "#f59e0b", hexClaro: "#fbbf24" },
    { id: 'cyan', nombre: 'Cyan', hex: "#06b6d4", hexClaro: "#22d3ee" },
]

export default function customizacion({ esOscuro, alternarOscuro, colorPrimario, setColorPrimario, alCerrar }) {

    const cambiarcolor = (color) => {
        setColorPrimario(color);

        document.documentElement.style.setProperty('--c_principal_fuerte', color.hex);
        document.documentElement.style.setProperty('--c_principal_claro', color.hexClaro);
    }

    return (

        <div className="panel">
            <div className='cabeza_panel'>
                <h2>Personalizar tema</h2>
                <button className='btncerrar' onClick={alCerrar}><X size={20} /> </button>
            </div>

            <div className='seccion_panel'>
                <h3>Esquema de color</h3>
                <div className='grid_colores'>
                    {colores.map((color) => (
                        <button
                            key={color.id}
                            className={`btn_color ${colorPrimario.id === color.id ? 'seleccionado' : ''}`}
                            onClick={() => cambiarcolor(color)}>
                            <span className='circulo_color' style={{ backgroundColor: color.hex }}></span>
                            <span className='nombre_color'>{color.nombre}</span>
                        </button>
                    ))}
                </div>
            </div>

            { /* modo oscuro */}
            <div className='seccion2'>
                <div>
                    <h3>Modo Oscuro</h3>
                    <p className='ayuda'>Cambia entre tema oscuro y claro</p>
                </div>
                <div className={`switch ${esOscuro ? 'switch-activo' : ''}`} onClick={alternarOscuro}>
                    <div className='bolita'></div>
                </div>
            </div>

            <div className='pie_panel'>
                <HelpCircle size={20} className='ayuda2'></HelpCircle>
            </div>
        </div>

    )
}
