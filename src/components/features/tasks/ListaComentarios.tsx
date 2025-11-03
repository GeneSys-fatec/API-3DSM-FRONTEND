import { useState, useEffect } from "react";
import type { Comentario } from "@/types/types";
import { useOptionsMenu } from "@/hooks/useOptionsMenu";
import { authFetch } from "@/utils/api";
import { toast } from "react-toastify";

interface ListaComentariosProps {
    tarId: string;
}

export default function ListaComentarios({ tarId }: ListaComentariosProps) {
    const [comentarios, setComentarios] = useState<Comentario[]>([])
    const [novoComentario, setNovoComentario] = useState("")
    const [comentarioEditandoId, setComentarioEditandoId] = useState<string | null>(null)
    const [novoTextoComentario, setNovoTextoComentario] = useState<string>("")
    const optionsMenu = useOptionsMenu()
    const [novaResposta, setNovaResposta] = useState("")
    const [comentarioRespondendoId, setComentarioRespondendoId] = useState<string | null>(null)
    const [comentarioExcluindoId, setComentarioExcluindoId] = useState<string | null>(null)
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)

    const carregarComentarios = async () => {
        try {
            const response = await authFetch(`http://localhost:8080/comentario/tarefa/${tarId}`)
            if (!response.ok) {
                console.error("Erro HTTP:", response.status)
                setComentarios([])
                return
            }
            const data = await response.json()
            setComentarios(organizarRespostas(Array.isArray(data) ? data : []))
        } catch (error) {
            console.error('Erro ao carregar comentários:', error)
            setComentarios([])
        }
    }

    const adicionarComentario = async () => {
        try {
            if (!novoComentario.trim()) {
                toast.error("A mensagem não pode estar em branco!")
                return
            }

            const response = await authFetch("http://localhost:8080/comentario/cadastrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    comMensagem: novoComentario,
                    comDataCriacao: new Date().toISOString(),
                    tarId: tarId,
                    comResposta: null
                }),
                credentials: "include",
            })

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || "Comentário contém palavras proibidas.");
                return;
            }
            
            toast.success("Comentário adicionado com sucesso!")
            setNovoComentario("")
            carregarComentarios()
            optionsMenu.close()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao adicionar o comentário.")
        }
    }

    const editarComentario = async (comentario: Comentario) => {
        if (!novoTextoComentario.trim()) {
            toast.error("A mensagem não pode estar em branco!")
            return
        }

        try {
            const response = await authFetch(`http://localhost:8080/comentario/atualizar/${comentario.comId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...comentario,
                    comMensagem: novoTextoComentario,
                    comDataAtualizacao: new Date().toISOString(),
                }),
                credentials: "include",
            })

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || "Comentário contém palavras proibidas");
                return;
            }

            toast.success("Comentário atualizado com sucesso!")
            setComentarioEditandoId(null)
            carregarComentarios()
        } catch (error) {
            console.error("Erro ao atualizar comentário:", error)
            toast.error("Erro ao atualizar o comentário.")
        }
    }

    const excluirComentario = async () => {
        if (!comentarioExcluindoId) {
            return
        }
        await authFetch(`http://localhost:8080/comentario/apagar/${comentarioExcluindoId}`, {
            method: "DELETE",
            credentials: "include",
        })
        setComentarioExcluindoId(null)
        setMostrarConfirmacao(false)
        carregarComentarios()
        optionsMenu.close()
    }

    const confirmarExclusao = (comId: string) => {
        setComentarioExcluindoId(comId)
        setMostrarConfirmacao(true)
    }

    const organizarRespostas = (comentarios: Comentario[]) => {
        const principais = comentarios.filter(comentario => !comentario.comResposta)
        return principais.map(principal => ({
            ...principal,
            replies: comentarios.filter(comentario => comentario.comResposta === principal.comId)
        }))
    }

    const adicionarResposta = async (respostaParaId: string) => {
        try {
            if (!novaResposta.trim()) {
                toast.error("A mensagem não pode estar em branco!")
                return
            }

             const response = await authFetch("http://localhost:8080/comentario/cadastrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    comMensagem: novaResposta,
                    comDataCriacao: new Date().toISOString(),
                    tarId: tarId,
                    comResposta: respostaParaId
                }),
                credentials: "include",
            })

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || "Comentário contém palavras proibidas");
                return;
            }

            toast.success("Resposta adicionada com sucesso!")
            setNovoComentario("")
            setComentarioRespondendoId(null)
            carregarComentarios()
        } catch (error) {
            console.error(error)
            toast.error("Erro ao adicionar a resposta.")
        }
    }

    useEffect(() => {
        carregarComentarios()
    }, [tarId])

    return (
        <>
            <div className="flex flex-col w-full gap-4">
                <div className="flex flex-col gap-4">
                    <textarea value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        placeholder="Adicione um comentário..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-24 p-2 resize-none"
                    />
                    <button type="button" onClick={adicionarComentario} className="self-end px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Enviar</button>
                </div>
                <ul className="flex flex-col gap-8">
                    {comentarios.map((comentario) => (
                        <li key={comentario.comId} className="flex flex-col w-full gap-2">
                            <div className="flex items-start gap-3">
                                <div className="bg-gray-300 rounded-full items-center justify-center text-xl font-bold text-gray-600 py-2 px-4">
                                    {comentario.usuNome.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                        <p className="font-semibold leading-none">{comentario.usuNome}</p>
                                        <p className="text-xs text-gray-500">{new Date(comentario.comDataAtualizacao).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    {comentarioEditandoId === comentario.comId ? (
                                        <div className="flex flex-col w-full gap-2">
                                            <textarea value={novoTextoComentario}
                                                onChange={(e) => setNovoTextoComentario(e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-24 p-2 resize-none"
                                            />
                                            <div className="flex self-end gap-2">
                                                <button type="button" onClick={() => setComentarioEditandoId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                                    <span>Cancelar</span>
                                                </button>
                                                <button type="button" onClick={() => editarComentario(comentario)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                                    <span>Salvar</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p>{comentario.comMensagem}</p>
                                    )}
                                    {!comentarioRespondendoId && (
                                        <button type="button" className="flex self-start text-xs text-gray-500 gap-1 leading-none pt-1" onClick={() => setComentarioRespondendoId(comentarioRespondendoId === comentario.comId ? null : comentario.comId)}>
                                            <i className="fa-solid fa-reply"></i>
                                            <span>Responder</span>
                                        </button>
                                    )}
                                    {comentarioRespondendoId === comentario.comId && (
                                        <div className="mt-3 flex flex-col gap-2">
                                            <textarea value={novaResposta}
                                                onChange={(e) => setNovaResposta(e.target.value)}
                                                placeholder="Adicione sua resposta..."
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 resize-none"
                                            />
                                            <div className="flex self-end gap-2">
                                                <button type="button" onClick={() => { setComentarioRespondendoId(null); setNovaResposta("") }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                                    <span>Cancelar</span>
                                                </button>
                                                <button type="button" onClick={() => adicionarResposta(comentario.comId)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                                    <span>Salvar</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <ul className="flex flex-col gap-8 pt-4">
                                        {comentario.replies?.map((reply) => (
                                            <li key={reply.comId} className="flex flex-col w-full gap-2 text-sm">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-gray-300 rounded-full items-center justify-center font-bold text-gray-600 py-2 px-3">
                                                        {reply.usuNome.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col flex-1">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                                            <p className="font-semibold leading-none">{reply.usuNome}</p>
                                                            <p className="text-xs text-gray-500">{new Date(reply.comDataAtualizacao).toLocaleDateString('pt-BR')}</p>
                                                        </div>
                                                        {comentarioEditandoId === reply.comId ? (
                                                            <div className="flex flex-col w-full gap-2">
                                                                <textarea value={novoTextoComentario}
                                                                    onChange={(e) => setNovoTextoComentario(e.target.value)}
                                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 resize-none"
                                                                />
                                                                <div className="flex self-end gap-2">
                                                                    <button type="button" onClick={() => setComentarioEditandoId(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                                                        <span>Cancelar</span>
                                                                    </button>
                                                                    <button type="button" onClick={() => editarComentario(reply)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                                                        <span>Salvar</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p>{reply.comMensagem}</p>
                                                        )}
                                                    </div>
                                                    <i role="button" aria-label="Mais opções" title="Mais opções" tabIndex={0} onClick={(e) => optionsMenu.open(e, reply.comId)}
                                                        className={`fa-solid fa-ellipsis-vertical cursor-pointer p-2 rounded-full flex-shrink-0 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                                                    />
                                                    {optionsMenu.isOpen && optionsMenu.selectedId === reply.comId && optionsMenu.position && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={(e) => {e.stopPropagation(); optionsMenu.close();}}></div>
                                                            <div className="fixed z-50 bg-white border border-slate-200 rounded-md shadow-lg w-44 p-2"
                                                                style={{
                                                                    top: optionsMenu.position.top,
                                                                    left: optionsMenu.position.left,
                                                                    transform: "translate(calc(-100% - 6px), -50%)",
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <button type="button" onClick={() => {setComentarioEditandoId(reply.comId); setNovoTextoComentario(reply.comMensagem); optionsMenu.close()}}
                                                                    className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2">
                                                                    <i className="fa-solid fa-pen text-slate-600"></i>
                                                                    <span>Editar</span>
                                                                </button>
                                                                <button type="button" onClick={() => confirmarExclusao(reply.comId)}
                                                                    className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-700 flex items-center gap-2 disabled:opacity-60">
                                                                    <i className="fa-solid fa-trash"></i>
                                                                    <span>Excluir</span>
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <i role="button" aria-label="Mais opções" title="Mais opções" tabIndex={0}
                                    onClick={(e) => optionsMenu.open(e, comentario.comId)}
                                    className={`fa-solid fa-ellipsis-vertical cursor-pointer p-2 rounded-full flex-shrink-0 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                                />
                            </div>
                            {optionsMenu.isOpen && optionsMenu.selectedId === comentario.comId && optionsMenu.position && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={optionsMenu.close}></div>
                                    <div className="fixed z-50 bg-white border border-slate-200 rounded-md shadow-lg w-44 p-2"
                                        style={{
                                            top: optionsMenu.position.top,
                                            left: optionsMenu.position.left,
                                            transform: "translate(calc(-100% - 6px), -50%)",
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button type="button" onClick={() => {setComentarioEditandoId(comentario.comId); setNovoTextoComentario(comentario.comMensagem); optionsMenu.close()}} className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 flex items-center gap-2">
                                            <i className="fa-solid fa-pen text-slate-600"></i>
                                            <span>Editar</span>
                                        </button>
                                        <button type="button" onClick={() => confirmarExclusao(comentario.comId)}
                                            className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-700 flex items-center gap-2 disabled:opacity-60">
                                            <i className="fa-solid fa-trash"></i>
                                            <span>Excluir</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {mostrarConfirmacao && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="text-center">
                            <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl mb-4"></i>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Tem certeza?
                            </h3>
                            <p className="text-gray-600">
                                Esta ação não pode ser desfeita. O comentário será excluído permanentemente.
                            </p>
                            <div className="flex gap-4 justify-center pt-5">
                                <button type="button" onClick={() => {setMostrarConfirmacao(false); setComentarioExcluindoId(null)}}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                                    <span>Cancelar</span>
                                </button>
                                <button type="button" onClick={excluirComentario}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                                    <span>Excluir</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}