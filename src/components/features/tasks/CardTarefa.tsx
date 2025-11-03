import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useMediaQuery from "@/hooks/MediaQuerie";

import type { Tarefa, ResponsavelTarefa } from "@/types/types";
import { Trash } from "lucide-react";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";

interface CardTarefaProps {
  tarefa: Tarefa;
  onAbrirModalEdicao?: (tarefa: Tarefa) => void;
  isOverlay?: boolean;
  corClasse?: string;
  onExcluir?: (tarefa: Tarefa) => void;
}

const Avatar = ({ responsavel }: { responsavel: ResponsavelTarefa }) => {
  const inicial = responsavel.usuNome?.charAt(0)?.toUpperCase() || "?";
  return (
    <div
      title={responsavel.usuNome}
      className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold border-2 border-white"
    >
      {inicial}
    </div>
  );
};

export default function CardTarefa(props: CardTarefaProps) {
  const { tarefa, onAbrirModalEdicao, isOverlay, corClasse, onExcluir } = props;

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tarefa.tarId,
    data: { type: "task", tarefa },
    disabled: !isDesktop,
  });

  const conditionalListeners = isDesktop ? listeners : undefined;

  const style = {
    transition,
    transform: isOverlay ? undefined : CSS.Transform.toString(transform),
    opacity: isDragging && !isOverlay ? 0 : 1,
  };

  const prioridadeEstilo: { [key: string]: string } = {
    Alta: "bg-red-100 text-red-700",
    Média: "bg-yellow-100 text-yellow-700",
    Baixa: "bg-green-100 text-green-700",
  };

  const classePrioridade = tarefa.tarPrioridade
    ? prioridadeEstilo[tarefa.tarPrioridade]
    : "bg-gray-100 text-gray-800";

  const classesDinamicas = isOverlay
    ? `shadow-2xl scale-105 rotate-1`
    : `hover:scale-105 ${
        corClasse
          ? `border-l-4 border-${corClasse} hover:border-${corClasse}`
          : ""
      }`;

  const cursorClasses = isDesktop
    ? "hover:cursor-grab active-cursor-grabbing"
    : "cursor-pointer";

  const responsaveis = tarefa.responsaveis || [];
  const maxAvatares = 2;
  const avataresExibidos = responsaveis.slice(0, maxAvatares);
  const avataresOcultos = responsaveis.length - maxAvatares;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      {...conditionalListeners}
      onClick={() => onAbrirModalEdicao && onAbrirModalEdicao(tarefa)}
      className={`bg-white p-3 rounded-lg shadow-md group 
        transition-all duration-200 ease-in-out 
        ${isDesktop ? "touch-none" : ""} 
        ${classesDinamicas} 
        ${cursorClasses}`}
    >
      <div className="flex justify-between h-full">
        <div className="flex flex-col justify-between truncate">
          <h2 className="font-semibold text-gray-800 pr-2 truncate">
            {tarefa.tarTitulo}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${classePrioridade}`}
            >
              {tarefa.tarPrioridade}
            </span>
            <span className="text-sm text-gray-500 ">
              {formatDateToDDMMYYYY(tarefa.tarPrazo)}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between items-center gap-2">
          <button
            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Excluir tarefa"
            onClick={(e) => {
              e.stopPropagation();
              if (onExcluir) onExcluir(tarefa);
            }}
          >
            <Trash className="h-4" />
          </button>

          <div className="flex -space-x-2">
            {avataresExibidos.map((resp) => (
              <Avatar key={resp.usuId} responsavel={resp} />
            ))}
            {avataresOcultos > 0 && (
              <div
                title={`${avataresOcultos} outros responsáveis`}
                className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold border-2 border-white"
              >
                +{avataresOcultos}
              </div>
            )}
            {responsaveis.length === 0 && (
              <div
                title="Sem responsável"
                className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold border-2 border-white"
              >
                ?
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
