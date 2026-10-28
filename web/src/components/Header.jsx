import React from 'react';
import { LogOut, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header({ activeTab }) {
  const { logout, user } = useAuth();

  const tabTitles = {
    tablero: 'Tablero de Tareas Kanban',
    hoy: 'Sesión y Tareas de Hoy',
    compras: 'Gestión de Compras y Suministros',
    inventario: 'Inventario de Equipos y Estaciones',
    bitacora: 'Historial de Bitácora y Evidencias',
    reportes: 'Reportes Ejecutivos de Soporte',
    ajustes: 'Ajustes y Respaldo'
  };

  return (
    <header className="top-header no-print">
      <div className="top-header-title">
        <Wrench size={20} color="#0284c7" style={{ display: 'inline-block' }} />
        <span>Insigneo — {tabTitles[activeTab] || 'Soporte TI'}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>{user || 'Santiago'}</span>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={logout}
          title="Cerrar sesión"
          style={{ padding: '0.3rem 0.5rem' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
