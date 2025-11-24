import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaginaRecuperacaoSenha() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    const [senha, setSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    const toggleMostrarSenha = () => setMostrarSenha(prev => !prev);
    const toggleMostrarConfirmacaoSenha = () => setMostrarConfirmacaoSenha(prev => !prev);

    const handleSalvar = async () => {
        if (senha !== confirmacao) {
            setMensagem("As senhas não coincidem!");
            return;
        }
        if (!token) {
            setMensagem("Token inválido ou ausente.");
            return;
        }

        setCarregando(true);
        setMensagem("");

        try {
            const response = await fetch(`http://localhost:8000/auth/resetar-senha?token=${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ senha: senha })
            });

            if (response.ok) {
                setSucesso(true);
            } else {
                const erroTexto = await response.text();
                setMensagem("Erro: " + erroTexto);
            }
        } catch (error) {
            setMensagem("Erro ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    };

    if (sucesso) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-xs md:max-w-md p-8 bg-white flex flex-col items-center justify-center rounded-lg shadow-2xl text-center animate-fade-in-up">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <i className="fa-solid fa-check text-3xl text-green-600"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Senha Alterada!</h2>
                    <p className="text-gray-600 mb-6">
                        Sua senha foi redefinida com sucesso. Agora você pode acessar sua conta com a nova credencial.
                    </p>
                    <button 
                        onClick={() => navigate("/login")}
                        className="w-full bg-indigo-950 text-white rounded-sm font-medium py-2 hover:bg-indigo-900 transition-colors"
                    >
                        Ir para o Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex items-center justify-center bg-gray-100"> 
            <div className="w-full max-w-xs md:max-w-md py-8 bg-white flex flex-col items-center justify-center rounded-lg shadow-2xl">
                <p className="text-xl md:text-2xl pb-6 font-semibold text-gray-700">Redefinir senha</p>
                
                {mensagem && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4 w-10/12 text-sm text-center">
                        {mensagem}
                    </div>
                )}

                <div className="w-full flex flex-col items-center justify-center">
                    <div className="w-full max-w-3xs md:max-w-xs mx-auto flex flex-col gap-4">
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                placeholder="Nova senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="w-full bg-white pl-10 pr-10 py-2 border border-gray-300 outline-none rounded-sm focus:border-indigo-950 transition-colors"
                            />
                            <i onClick={toggleMostrarSenha} className={`fa-solid ${mostrarSenha ? "fa-eye-slash" : "fa-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600`}></i>
                        </div>
                        
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type={mostrarConfirmacaoSenha ? "text" : "password"}
                                placeholder="Confirmar senha"
                                value={confirmacao}
                                onChange={(e) => setConfirmacao(e.target.value)}
                                className="w-full bg-white pl-10 pr-10 py-2 border border-gray-300 outline-none rounded-sm focus:border-indigo-950 transition-colors"
                            />
                            <i onClick={toggleMostrarConfirmacaoSenha} className={`fa-solid ${mostrarConfirmacaoSenha ? "fa-eye-slash" : "fa-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600`}></i>
                        </div>

                        <button 
                            onClick={handleSalvar}
                            disabled={carregando}
                            className={`w-full text-white rounded-sm outline-none font-medium p-2 mt-2 transition-colors ${carregando ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-950 hover:bg-indigo-900 cursor-pointer'}`}
                        >
                            {carregando ? (
                                <span><i className="fa-solid fa-spinner fa-spin mr-2"></i>Salvando...</span>
                            ) : "Salvar alterações"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}