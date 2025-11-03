import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "./authService";
import { useAuth } from "@/context/AuthContext";

interface LoginState {
  usuEmail: string;
  usuSenha: string;
}

const FormularioLogin = () => {
  const navigate = useNavigate();
  const { logarUsuario } = useAuth();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<{ [campo: string]: string }>({});
  const [state, setState] = useState<LoginState>({ usuEmail: "", usuSenha: "" });

  const { usuEmail, usuSenha } = state;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setState((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErros((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const toggleMostrarSenha = () => setMostrarSenha(prev => !prev);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await login(state);
      const campos = ["usuEmail", "usuSenha"];
      const errosMap: { [campo: string]: string } = {};

      if (data.usuNome) {
        logarUsuario(data.usuNome);
        toast.success("Usuário logado com sucesso!");
        navigate("/home");
        return;
      }

      if (data.mensagem) {
        let erroEncontrado = false;
        campos.forEach((campo) => {
          if (data.mensagem?.toLowerCase().includes(campo.toLowerCase())) {
            errosMap[campo] = data.mensagem;
            erroEncontrado = true;
          }
        });

        setErros(errosMap);

        if (!erroEncontrado) {
          toast.error(data.mensagem);
        }
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor.", error);
      toast.error("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div className="flex flex-col md:flex-row justify-center bg-gray-100 items-center min-h-screen p-4">
      <div className="absolute top-0 left-0 w-full md:hidden">
        <img src="./BgTop.png" className="img-fluid" />
      </div>
      <div className="absolute bottom-0 left-0 w-full md:hidden">
        <img src="./BgBottom.png" className="img-fluid" />
      </div>

      <div className="w-full md:w-120 h-auto md:h-120 flex flex-col items-center justify-center md:bg-gray-200 md:shadow-md md:rounded-s-sm p-6 z-0">
        <h1 className="font-medium text-xl md:text-2xl pb-8">Login</h1>
        <form className="w-full flex flex-col items-center gap-6 md:gap-4" onSubmit={handleSubmit}>
          <div className="relative w-full max-w-xs">
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="email"
                placeholder="E-mail"
                name="usuEmail"
                className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm"
                value={usuEmail}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="relative w-full max-w-xs">
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                name="usuSenha"
                className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm"
                value={usuSenha}
                onChange={handleChange}
              />
              <i onClick={toggleMostrarSenha} className={`fa-solid ${mostrarSenha ? "fa-eye-slash" : "fa-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer`}></i>
            </div>
          </div>

          <button type="submit" className="w-full max-w-xs bg-indigo-950 text-white rounded-sm outline-none cursor-pointer p-2 m-2">
            Login
          </button>
        </form>
        <Link to="/cadastro" className="underline decoration-solid p-2 text-sm hover:text-blue-900">
          Não tem uma conta? Cadastre-se
        </Link>
      </div>

      <div className="hidden md:flex w-full md:w-120 h-auto md:h-120 flex-col items-center justify-center bg-indigo-950 shadow-md rounded-e-sm p-6">
        <h1 className="font-medium text-xl md:text-2xl text-white pt-8">
          Bem-vindo de volta!
        </h1>
        <p className="text-center text-white text-sm md:text-base">
          Para se manter conectado com a gente,
          <br />
          por favor digite suas informações pessoais.
        </p>
        <img src="./Login.png" className="w-60 md:w-110 pt-3 img-fluid" />
      </div>
    </div>
  );
}

export default FormularioLogin;