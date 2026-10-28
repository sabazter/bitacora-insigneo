import React, { useState } from 'react';
import { Wrench, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginView() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!password) return;

    setError('');
    setIsLoading(true);
    try {
      await login(password);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 100%)'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '2.25rem 2rem',
        boxShadow: '0 25px 35px -5px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            marginBottom: '0.85rem'
          }}>
            <Wrench size={30} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Insigneo TI
          </h1>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginTop: '0.25rem' }}>
            Gestión de Soporte, Bitácora e Inventario
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>
              Contraseña de acceso
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem', height: '46px' }}
                placeholder="Ingresa tu contraseña..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                required
              />
              <Lock 
                size={18} 
                style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} 
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ height: '46px', fontSize: '15px', fontWeight: 600 }}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Verificando...' : 'Entrar al Sistema'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
          Acceso privado administrativo para Santiago • Insigneo
        </div>
      </div>
    </div>
  );
}
