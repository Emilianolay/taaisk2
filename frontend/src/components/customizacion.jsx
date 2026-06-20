"use client";

import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import './customizacion.css';

const colores = [
    { id: "blue", name: 'azul', hex: "#3b82f6", lightHex: "#93c5fd" },
    { id: 'purple', name: 'morado', hex: '#a855f7', lightHex: '#d8b4fe' },
    { id: 'green', name: 'verde', hex: '#22c55e', lightHex: '#86efac' },
    { id: 'pink', name: 'rosa', hex: '#ec4899', lightHex: '#f9a8d4' },
    { id: 'orange', name: 'naranja', hex: '#f97316', lightHex: '#fdba74' },
    { id: 'agua', name: 'agua', hex: '#14b8a6', lightHex: '#5eead4' },

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
