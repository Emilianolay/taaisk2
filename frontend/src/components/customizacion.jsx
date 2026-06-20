"use client";

import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import './customizacion.css';

const colores = [
    { id: "indigo", name: 'Índigo', hex: "#6366f1", lightHex: "#818cf8" },
    { id: 'violet', name: 'Violeta', hex: "#8b5cf6", lightHex: "#a78bfa" },
    { id: 'emerald', name: 'Esmeralda', hex: "#10b981", lightHex: "#34d399" },
    { id: 'rose', name: 'Rosa Neón', hex: "#f43f5e", lightHex: "#fb7185" },
    { id: 'amber', name: 'Ámbar', hex: "#f59e0b", lightHex: "#fbbf24" },
    { id: 'cyan', name: 'Cyan', hex: "#06b6d4", lightHex: "#22d3ee" },
]

export default function customizacion({ isDark, toggleDark, primaryColor, setPrimaryColor, onClose }) {

    const cambiarcolor = (color) => {
        setPrimaryColor(color);

        document.documentElement.style.setProperty('--c_principal_fuerte', color.hex);
        document.documentElement.style.setProperty('--c_principal_claro', color.lightHex);
    }

    return (

        <div className="panel">
            <div className='cabeza_panel'>
                <h2>Personalizar tema</h2>
                <button className='btncerrar' onClick={onClose}><X size={20} /> </button>
            </div>

            <div className='seccion_panel'>
                <h3>Esquema de color</h3>
                <div className='grid_colores'>
                    {colores.map((color) => (
                        <button
                            key={color.id}
                            className={`btn_color ${primaryColor.id === color.id ? 'seleccionado' : ''}`}
                            onClick={() => cambiarcolor(color)}>
                            <span className='circulo_color' style={{ backgroundColor: color.hex }}></span>
                            <span className='nombre_color'>{color.name}</span>
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
                <div className={`switch ${isDark ? 'switch-activo' : ''}`} onClick={toggleDark}>
                    <div className='bolita'></div>
                </div>
            </div>

            <div className='pie_panel'>
                <HelpCircle size={20} className='ayuda2'></HelpCircle>
            </div>
        </div>

    )
}