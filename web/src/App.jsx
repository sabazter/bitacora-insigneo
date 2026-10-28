import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginView } from './views/LoginView';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { TaskModal } from './components/TaskModal';
import { PurchaseModal } from './components/PurchaseModal';
import { Lightbox } from './components/Lightbox';

import { TableroView } from './views/TableroView';
import { HoyView } from './views/HoyView';
import { InventarioView } from './views/InventarioView';
import { ComprasView } from './views/ComprasView';
import { BitacoraView } from './views/BitacoraView';
import { ReportesView } from './views/ReportesView';
import { AjustesView } from './views/AjustesView';

export function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('tablero');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b132b',
        color: '#38bdf8',
        fontWeight: 600,
        fontSize: '18px'
      }}>
        Cargando Insigneo TI...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleOpenTask = (id, category) => {
    if (category === 'compra') {
      setSelectedPurchaseId(id);
    } else {
      setSelectedTaskId(id);
    }
  };

  const handleCloseTask = () => {
    setSelectedTaskId(null);
  };

  const handleClosePurchase = () => {
    setSelectedPurchaseId(null);
  };

  const handleTaskUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleTaskDeleted = () => {
    setSelectedTaskId(null);
    setSelectedPurchaseId(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleSelectPhoto = photo => {
    setSelectedPhoto(photo);
  };

  const handleClosePhoto = () => {
    setSelectedPhoto(null);
  };

  return (
    <div className="app-container">
      {/* Navegación (Sidebar en desktop, barra inferior en móvil) */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main className="main-content">
        <Header activeTab={activeTab} />

        <div key={refreshKey}>
          {activeTab === 'tablero' && (
            <TableroView
              onOpenTask={handleOpenTask}
            />
          )}

          {activeTab === 'hoy' && (
            <HoyView
              onOpenTask={handleOpenTask}
              onSelectPhoto={handleSelectPhoto}
            />
          )}

          {activeTab === 'compras' && (
            <ComprasView />
          )}

          {activeTab === 'inventario' && (
            <InventarioView />
          )}

          {activeTab === 'bitacora' && (
            <BitacoraView
              onSelectPhoto={handleSelectPhoto}
              onOpenTask={handleOpenTask}
            />
          )}

          {activeTab === 'reportes' && (
            <ReportesView
              onSelectPhoto={handleSelectPhoto}
            />
          )}

          {activeTab === 'ajustes' && (
            <AjustesView />
          )}
        </div>
      </main>

      {/* Modal de Detalle y Edición de Tarea */}
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={handleCloseTask}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onSelectPhoto={handleSelectPhoto}
        />
      )}

      {/* Modal Dedicado de Gestión de Compra */}
      {selectedPurchaseId && (
        <PurchaseModal
          taskId={selectedPurchaseId}
          onClose={handleClosePurchase}
          onSaved={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}

      {/* Lightbox para fotos en pantalla completa */}
      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={handleClosePhoto}
        />
      )}
    </div>
  );
}

export default App;
