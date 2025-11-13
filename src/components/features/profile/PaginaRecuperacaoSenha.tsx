import { useState } from "react";

export default function PaginaRecuperacaoSenha() {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);
    const toggleMostrarSenha = () => setMostrarSenha(prev => !prev);
    const toggleMostrarConfirmacaoSenha = () => setMostrarConfirmacaoSenha(prev => !prev);

    return (
        <div className="w-full max-w-xs md:max-w-md h-full max-h-80 md:max-h-100 bg-white flex flex-col items-center justify-center rounded-lg shadow-2xl">
            <p className="text-xl md:text-2xl pb-6">Redefinir senha</p>
            <div className="w-full flex flex-col items-center justify-center">
                <div className="w-full max-w-3xs md:max-w-xs mx-auto flex flex-col gap-4">
                    <div className="relative">
                        <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type={mostrarSenha ? "text" : "password"}
                            placeholder="Nova senha"
                            name=""
                            className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm"
                        />
                        <i onClick={toggleMostrarSenha} className={`fa-solid ${mostrarSenha ? "fa-eye-slash" : "fa-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer`}></i>
                    </div>
                    <div className="relative">
                        <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type={mostrarConfirmacaoSenha ? "text" : "password"}
                            placeholder="Confirmar senha"
                            name=""
                            className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm"
                        />
                        <i onClick={toggleMostrarConfirmacaoSenha} className={`fa-solid ${mostrarConfirmacaoSenha ? "fa-eye-slash" : "fa-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer`}></i>
                    </div>
                    <button type="submit" className="w-full bg-indigo-950 text-white rounded-sm outline-none cursor-pointer p-2 mt-2">
                        Salvar alterações
                    </button>
                </div>
            </div>
        </div>
    )
}