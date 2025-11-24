import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { atualizarFoto, atualizarNomeEmail, atualizarSenha } from "../profile/perfilService";

interface CriteriosSenha {
    tamanho: boolean;
    maiuscula: boolean;
    numero: boolean;
    caractere: boolean;
}

export const ModalEditarPerfil: React.FC = () => {
    const { closeModal } = useModal();
    const modalRef = useRef<HTMLDivElement>(null);
    const { usuId, usuNome, usuEmail, usuCaminhoFoto, logarUsuario } = useAuth();
    const [nome, setNome] = useState(usuNome || "");
    const [email, setEmail] = useState(usuEmail || "");
    const [senhaAntiga, setSenhaAntiga] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [previewFoto, setPreviewFoto] = useState(usuCaminhoFoto || "");
    const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
    const [mostrarSenhaAntiga, setMostrarSenhaAntiga] = useState(false);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [mostrarValidacao, setMostrarValidacao] = useState(false);
    const [criteriosSenha, setCriteriosSenha] = useState<CriteriosSenha>({ tamanho: false, maiuscula: false, numero: false, caractere: false });
    const [forcaSenha, setForcaSenha] = useState(0);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                closeModal();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeModal]);

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const arquivo = e.target.files?.[0];
        if (arquivo) {
            if (!['image/jpeg', 'image/png'].includes(arquivo.type)) {
                toast.error("Formato inválido. Apenas .jpeg ou .png.")
                return;
            }
            setFotoArquivo(arquivo)
            setPreviewFoto(URL.createObjectURL(arquivo));
        }
    };

    const inicialUsuario = nome?.charAt(0)?.toUpperCase() || "?";

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
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let houveAlteracao = false;
            let novoNome = nome;
            let novoEmail = email;
            let novoCaminhoFoto = usuCaminhoFoto;

            if (nome !== usuNome || email !== usuEmail) {
                const usuarioAtualizado = await atualizarNomeEmail(String(usuId), nome, email);
                novoNome = usuarioAtualizado.usuNome || nome;
                novoEmail = usuarioAtualizado.usuEmail || email;
                houveAlteracao = true;
            }

            if (novaSenha) {
                if (novaSenha !== confirmarSenha) {
                    toast.error("As senhas não coincidem.");
                    return;
                }

                await atualizarSenha(String(usuId), senhaAntiga, novaSenha);
                houveAlteracao = true;
            }

            if (fotoArquivo) {
                const usuarioAtualizado = await atualizarFoto(String(usuId), fotoArquivo);

                const URL_BASE_BACKEND = "http://localhost:8000";
                const nomeDoArquivo = usuarioAtualizado.usuCaminhoFoto;

                if (nomeDoArquivo) {
                    novoCaminhoFoto = `${URL_BASE_BACKEND}/usuario/foto/${nomeDoArquivo}`;
                    setPreviewFoto(novoCaminhoFoto);
                }

                novoNome = usuarioAtualizado.usuNome || novoNome;
                novoEmail = usuarioAtualizado.usuEmail || novoEmail;
                houveAlteracao = true;
            }

            if (houveAlteracao) {
                logarUsuario({
                    usuId: String(usuId),
                    usuNome: novoNome,
                    usuEmail: novoEmail,
                    usuCaminhoFoto: novoCaminhoFoto ?? undefined,
                });

                toast.success("Alterações salvas com sucesso!");
                closeModal();

            } else {
                toast.info("Nenhuma alteração realizada.");
                closeModal();
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar alterações.");
        }
    };

    const forcaCores = ["text-red-500", "text-orange-500", "text-yellow-500", "text-green-500"];
    const barraCores = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
    const forcaTextos = ["Muito fraca", "Fraca", "Média", "Forte"];
    const cor = forcaCores[forcaSenha - 1] || "text-gray-500";
    const barraCor = barraCores[forcaSenha - 1] || "bg-gray-200";

    return (
        <div className="fixed inset-0 bg-gray-600/60 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative">
                <button onClick={closeModal}
                    className="absolute top-4 right-5 text-xl text-gray-700 hover:text-black"> ✕
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-300 overflow-hidden text-gray-700 text-3xl font-bold">
                            {previewFoto ? (
                                <img src={previewFoto} alt="Foto de perfil" className="w-full h-full object-cover" />
                            ) : (
                                <span>{inicialUsuario}</span>
                            )}
                        </div>

                        <label htmlFor="foto"
                            className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-2 cursor-pointer hover:scale-110 transition-all duration-200 flex items-center justify-center"
                            title="Alterar foto">
                            <i className="fa-solid fa-pen text-sm"></i>
                        </label>
                        <input type="file" id="foto" accept="image/*" className="hidden" onChange={handleFotoChange} />
                    </div>
                </div>

                <form onSubmit={handleSalvar} className="flex flex-col gap-4">
                    <h3 className="text-gray-900 font-semibold pb-1">Perfil</h3>

                    <div className="relative">
                        <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)}
                            className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm"
                        />
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm"
                        />
                    </div>

                    <h3 className="text-gray-900 font-semibold pt-3">Senha</h3>
                    <div className="relative">
                        <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type={mostrarSenhaAntiga ? "text" : "password"}
                            placeholder="Senha antiga"
                            value={senhaAntiga}
                            onChange={(e) => setSenhaAntiga(e.target.value)}
                            className="w-full bg-white pl-10 pr-10 py-2 border border-gray-300 outline-none rounded-sm"
                        />
                        <i onClick={() => setMostrarSenhaAntiga(!mostrarSenhaAntiga)}
                            className={`fa-solid ${mostrarSenhaAntiga ? "fa-eye-slash" : "fa-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer`}>
                        </i>
                    </div>

                    <div className="relative">
                        <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type={mostrarNovaSenha ? "text" : "password"}
                            placeholder="Nova senha"
                            value={novaSenha}
                            onChange={(e) => { setNovaSenha(e.target.value), updateCriteriosSenha(e.target.value) }}
                            onFocus={() => setMostrarValidacao(true)}
                            onBlur={() => setMostrarValidacao(false)}
                            className="w-full bg-white pl-10 pr-10 py-2 border border-gray-300 outline-none rounded-sm"
                        />
                        <i onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                            className={`fa-solid ${mostrarNovaSenha ? "fa-eye-slash" : "fa-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer`}>
                        </i>

                        {(novaSenha && mostrarValidacao) && (
                            <div className="absolute top-full left-0 right-0 z-10 bg-white shadow-lg p-3 rounded-b-sm border border-t-0 border-gray-300">
                                <div className="mt-1">
                                    <div className="w-full bg-gray-200 h-2 rounded-full">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${barraCor}`}
                                            style={{ width: `${(forcaSenha / 4) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className={`mt-1 text-gray-600 ${cor}`}>
                                        {forcaTextos[forcaSenha - 1] || "Sem senha"}
                                    </p>
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

                    <div className="relative">
                        <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type={mostrarConfirmacao ? "text" : "password"}
                            placeholder="Confirmar nova senha"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            className="w-full bg-white pl-10 pr-10 py-2 border border-gray-300 outline-none rounded-sm"
                        />
                        <i onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                            className={`fa-solid ${mostrarConfirmacao ? "fa-eye-slash" : "fa-eye"} absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer`}>
                        </i>
                    </div>

                    <div className="flex justify-center py-3">
                        <button type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
