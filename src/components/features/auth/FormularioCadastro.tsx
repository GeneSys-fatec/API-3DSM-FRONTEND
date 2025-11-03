import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { cadastrar } from "./authService";

interface CriteriosSenha {
    tamanho: boolean;
    maiuscula: boolean;
    numero: boolean;
    caractere: boolean;
}

const FormularioCadastro: React.FC = () => {
    const navigate = useNavigate();
    const [erros, setErros] = useState<{ [campo: string]: string }>({});
    const [forcaSenha, setForcaSenha] = useState(0);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false);
    const [mostrarValidacao, setMostrarValidacao] = useState(false);
    const [form, setForm] = useState({ usuNome: "", usuEmail: "", usuSenha: "", usuConfirmarSenha: "" });
    const [criteriosSenha, setCriteriosSenha] = useState<CriteriosSenha>({ tamanho: false, maiuscula: false, numero: false, caractere: false });

    const { usuNome, usuEmail, usuSenha, usuConfirmarSenha } = form;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErros(prev => ({
            ...prev,
            [name]: ""
        }));

        if (name === "usuSenha") updateCriteriosSenha(value);

    }

    const updateCriteriosSenha = (senha: string) => {
        const criterios: CriteriosSenha = {
            tamanho: senha.length >= 8,
            maiuscula: /[A-Z]/.test(senha),
            numero: /\d/.test(senha),
            caractere: /[^A-Za-z0-9]/.test(senha),
        };
        const novaForca = Object.values(criterios).filter(Boolean).length;
        setCriteriosSenha(criterios);
        setForcaSenha(novaForca);
    }

    const toggleMostrarSenha = () => setMostrarSenha(prev => !prev);
    const toggleMostrarConfirmacaoSenha = () => setMostrarConfirmacaoSenha(prev => !prev);
    const handleFocus = () => setMostrarValidacao(true);
    const handleBlur = () => setMostrarValidacao(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        for (const [campo, valor] of Object.entries(form)) {
            if (!valor.trim()) {
                toast.error(`O ${campo.replace("usu", "").toLowerCase()}  é obrigatório!`);
                return;
            }
        }

        if (usuSenha !== usuConfirmarSenha) {
            setErros({ usuConfirmarSenha: "As senhas não coincidem." });
            toast.error("As senhas não coincidem.");
            return;
        }

        try {
            const { ok, data } = await cadastrar(form);
            const campos = ["usuNome", "usuEmail", "usuSenha", "usuConfirmarSenha"];
            const errosMap: { [campo: string]: string } = {};

            if (ok) {
                toast.success("Usuário cadastrado com sucesso!");
                setForm({ usuNome: "", usuEmail: "", usuSenha: "", usuConfirmarSenha: "" });
                setErros({});
                setTimeout(() => navigate("/login"), 1500);
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

    const forcaCores = ["text-red-500", "text-orange-500", "text-yellow-500", "text-green-500"];
    const barraCores = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
    const forcaTextos = ["Muito fraca", "Fraca", "Média", "Forte"];
    const cor = forcaCores[forcaSenha - 1] || "text-gray-500";
    const barraCor = barraCores[forcaSenha - 1] || "bg-gray-200";

    return (
        <div className="flex flex-col md:flex-row justify-center bg-gray-100 items-center min-h-screen p-4">
            <div className="absolute top-0 left-0 w-full md:hidden">
                <img src="./BgTop.png" className="img-fluid" />
            </div>
            <div className="absolute bottom-0 left-0 w-full md:hidden">
                <img src="./BgBottom.png" className="img-fluid" />
            </div>
            <div className="hidden md:flex w-full md:w-120 h-auto md:h-120 flex-col items-center justify-center bg-indigo-950 shadow-md rounded-s-sm p-6">
                <h1 className="font-medium text-xl md:text-2xl text-white pt-8">Bem-vindo!</h1>
                <p className="text-center text-white text-sm md:text-base"> Plataforma de Gerenciamento de Tarefas <br /> (To Do/Task Manager) </p>
                <img src="./Cadastro.png" className="w-60 md:w-110 pt-3 img-fluid" />
            </div>

            <div className="w-full md:w-120 h-auto md:h-120 flex flex-col items-center justify-center md:bg-gray-200 md:shadow-md md:rounded-s-sm p-6 z-0">
                <h1 className="font-medium text-xl md:text-2xl pb-8">Cadastro</h1>
                <form className="w-full flex flex-col items-center gap-4" onSubmit={handleSubmit}>

                    <div className="relative w-full max-w-xs">
                        <div className="relative">
                            <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="text" name="usuNome" value={usuNome} onChange={handleChange} placeholder="Nome" className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm" />
                        </div>
                    </div>

                    <div className="relative w-full max-w-xs">
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type="email" name="usuEmail" value={usuEmail} onChange={handleChange} placeholder="E-mail" className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm" />
                        </div>
                    </div>

                    <div className="relative w-full max-w-xs">
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type={mostrarSenha ? "text" : "password"}
                                name="usuSenha" value={usuSenha}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder="Senha"
                                className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm" />
                            <i onClick={toggleMostrarSenha} className={`fa-solid ${mostrarSenha ? "fa-eye-slash" : "fa-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer`}></i>
                        </div>

                        {(usuSenha && mostrarValidacao) && (
                            <div className="absolute top-full left-0 right-0 z-10 bg-white shadow-lg p-3 rounded-b-sm border border-t-0 border-gray-300">
                                <div className="mt-1">
                                    <div className="w-full bg-gray-200 h-2 rounded-full">
                                        <div className={`h-2 rounded-full transition-all duration-300 ${barraCor}`} style={{ width: `${(forcaSenha / 4) * 100}%` }}></div>
                                    </div>
                                    <p className={`mt-1 text-gray-600 ${cor}`}> {forcaTextos[forcaSenha - 1] || "Sem senha"} </p>
                                    <ul className="text-xs pt-2 space-y-1 text-gray-600">
                                        <li className={criteriosSenha.tamanho ? "text-green-600" : ""}>
                                            {criteriosSenha.tamanho ? "✓" : "•"} Mínimo de 8 caracteres
                                        </li>
                                        <li className={criteriosSenha.maiuscula ? "text-green-600" : ""}>
                                            {criteriosSenha.maiuscula ? "✓" : "•"} Pelo menos uma letra maiúscula
                                        </li>
                                        <li className={criteriosSenha.numero ? "text-green-600" : ""}>
                                            {criteriosSenha.numero ? "✓" : "•"} Pelo menos um número
                                        </li>
                                        <li className={criteriosSenha.caractere ? "text-green-600" : ""}>
                                            {criteriosSenha.caractere ? "✓" : "•"} Pelo menos um caractere especial
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative w-full max-w-xs">
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input type={mostrarConfirmacaoSenha ? "text" : "password"}
                                name="usuConfirmarSenha"
                                value={usuConfirmarSenha}
                                onChange={handleChange}
                                placeholder="Confirme sua senha"
                                className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm" />
                            <i onClick={toggleMostrarConfirmacaoSenha} className={`fa-solid ${mostrarConfirmacaoSenha ? "fa-eye-slash" : "fa-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer`}></i>
                        </div>
                    </div>

                    <button type="submit" className="w-full max-w-xs bg-indigo-950 text-white rounded-sm outline-none cursor-pointer p-2 m-2">
                        Cadastrar-se
                    </button>
                </form>
                <Link to="/login" className="underline decoration-solid p-2 text-sm hover:text-blue-900">
                    Já tem uma conta? Faça login
                </Link>
            </div>
        </div>
    );
}

export default FormularioCadastro;