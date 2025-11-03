import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

const RotaProtegida: React.FC = () => {
  const { autenticado, carregando } = useAuth(); 

  if (carregando) return <div>Verificando sessão...</div>;

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default RotaProtegida;