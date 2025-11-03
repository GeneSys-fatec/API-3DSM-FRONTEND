import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { logout, verificarSessao } from '@/components/features/auth/authService';

interface EstadoAuth {
  usuNome: string | null;
  autenticado: boolean;
}

interface TipoAuthContexto extends EstadoAuth {
  logarUsuario: (usuNome: string) => void;
  deslogarUsuario: (navegar: (caminho: string) => void) => void;
  carregando: boolean;
}

const estadoInicial: EstadoAuth = {
  usuNome: null,
  autenticado: false,
};

export const AuthContexto = createContext<TipoAuthContexto | undefined>(undefined);

export const useAuth = () => {
  const contexto = useContext(AuthContexto);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return contexto;
};

interface PropsAuthProvider {
  children: ReactNode;
}

export const AuthProvider: React.FC<PropsAuthProvider> = ({ children }) => {
  const [estado, setEstado] = useState<EstadoAuth>(estadoInicial);
  const [carregando, setCarregando] = useState(true);

  const logarUsuario = useCallback((usuNome: string) => {
    setEstado({ usuNome, autenticado: true });
  }, []);

  const deslogarUsuario = useCallback(async (navegar: (caminho: string) => void) => {
    try {
      await logout();
    } catch (erro) {
      console.error("Erro ao deslogar:", erro);
    } finally {
      setEstado(estadoInicial);
      navegar("/login");
    }
  }, []);

  useEffect(() => {
    const checarSessao = async () => {
      const dados = await verificarSessao();
      if (dados?.usuNome) {
        setEstado({ usuNome: dados.usuNome, autenticado: true });
      } else {
        setEstado(estadoInicial);
      }
      setCarregando(false);
    };

    checarSessao();
  }, []);

  return (
    <AuthContexto.Provider value={{ ...estado, logarUsuario, deslogarUsuario, carregando }}>
      {children}
    </AuthContexto.Provider>
  );
};
