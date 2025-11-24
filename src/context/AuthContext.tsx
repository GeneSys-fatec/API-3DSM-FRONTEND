import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { logout, verificarSessao } from '@/components/features/auth/authService';

interface EstadoAuth {
  usuId: string | null;
  usuNome: string | null;
  usuEmail: string | null;
  usuCaminhoFoto?: string | null;
  autenticado: boolean;
}

interface TipoAuthContexto extends EstadoAuth {
  logarUsuario: (usuario: { usuId: string; usuNome: string; usuEmail: string; usuCaminhoFoto?: string }) => void;
  deslogarUsuario: (navegar: (caminho: string) => void) => void;
  carregando: boolean;
}

const estadoInicial: EstadoAuth = {
  usuId: null,
  usuNome: null,
  usuEmail: null,
  usuCaminhoFoto: null,
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

  const logarUsuario = useCallback((usuario: {
    usuId: string, usuNome: string, usuEmail: string, usuCaminhoFoto?: string
  }) => {
    setEstado({
      usuId: usuario.usuId,
      usuNome: usuario.usuNome,
      usuEmail: usuario.usuEmail,
      usuCaminhoFoto: usuario.usuCaminhoFoto,
      autenticado: true
    });
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

  const URL_BASE_BACKEND = "http://localhost:8000";

  useEffect(() => {
    const checarSessao = async () => {
      const dados = await verificarSessao();
      if (dados?.usuId) {
        let fotoUrlCompleta: string | undefined = undefined;
        if (dados.usuCaminhoFoto) {
          fotoUrlCompleta = `${URL_BASE_BACKEND}/usuario/foto/${dados.usuCaminhoFoto}`;
        }
        setEstado({
          usuId: String(dados.usuId),
          usuNome: dados.usuNome,
          usuEmail: dados.usuEmail,
          usuCaminhoFoto: fotoUrlCompleta, 
          autenticado: true
        });
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
