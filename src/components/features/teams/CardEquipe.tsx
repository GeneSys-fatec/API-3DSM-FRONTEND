import { Usuario } from "@/types/types";

interface TeamCardProps {
    equId: string;
    equNome: string;
    equDescricao?: string;
    usuarios: Usuario[];
    corClasse: string;
    onDelete: (id: string) => void;
    onEdit?: () => void;
    onLeave?: (id: string) => void;
    onRemoveMember?: (email: string) => void;
}

export default function TeamCard({ equId, equNome, equDescricao, usuarios, corClasse, onDelete, onEdit, onLeave }: TeamCardProps) {
    const mapaDeCoresBorda: { [key: string]: string } = {
        "orange-400": "bg-orange-400 border-orange-400",
        "blue-400": "bg-blue-400 border-blue-400",
        "green-500": "bg-green-500 border-green-500",
        "purple-400": "bg-purple-400 border-purple-400",
        "red-400": "bg-red-400 border-red-400",
    };

    const coresAvatar = ["blue-400", "green-500", "purple-400", "orange-400", "red-400"];
    const classeCor = mapaDeCoresBorda[corClasse] || "bg-gray-400 border-gray-400";

    return (
        <div className="flex flex-col w-full h-auto bg-white shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className={`h-3 rounded-t-2xl ${classeCor}`}></div>
            <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                    <h3 className="text-xl font-extrabold text-gray-900 truncate">{equNome}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3 min-h-[48px]">
                        {equDescricao || "Sem descrição"}
                    </p>
                </div>

                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">

                    <div className="flex -space-x-6 relative">
                        {usuarios.slice(0, 3).map((u, i) => (
                            <div
                                key={i}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-gray-100/50 bg-${coresAvatar[i % coresAvatar.length]} text-white z-[${3 - i}]`}
                                title={u.usuNome}
                            >
                                {u.usuNome?.slice(0, 1).toUpperCase() || "?"}
                            </div>
                        ))}
                        {usuarios.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold border-2 border-white text-gray-600 ring-4 ring-gray-100/50">
                                +{usuarios.length - 3}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 text-gray-400">
                        <button onClick={() => onLeave?.(equId)} className="hover:text-yellow-500 transition" title="Sair da equipe">
                            <i className="fa-solid fa-right-from-bracket text-lg"></i>
                        </button>
                        {onEdit && (
                            <button onClick={onEdit} className="hover:text-blue-600 transition" title="Editar equipe">
                                <i className="fa-solid fa-pen-to-square text-lg"></i>
                            </button>
                        )}
                        <button onClick={() => onDelete(equId)} className="hover:text-red-500 transition" title="Excluir equipe">
                            <i className="fa-solid fa-trash text-lg"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
