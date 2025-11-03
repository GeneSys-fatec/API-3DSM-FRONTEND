import { useEffect, useState } from "react";
import TeamCard from "./CardEquipe";
import ModalCriarEquipe from "./ModalCriarEquipes";
import { deleteEquipe, getMinhasEquipes, sairDaEquipe } from "./teamService";
import { Equipe } from "@/types/types";
import { toast } from "react-toastify";
import ModalConfirmacao from "@/components/ui/ModalConfirmacao";
import ModalEditarEquipes from "./ModalEditarEquipes";
import { getErrorMessage } from "@/utils/errorUtils";

export default function ListaEquipes() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipeParaEditar, setEquipeParaEditar] = useState<Equipe | null>(null);
  const [equipeParaExcluir, setEquipeParaExcluir] = useState<Equipe | null>(null);

  const cores = ["blue-400", "green-500", "purple-400", "orange-400", "red-400"];

  useEffect(() => {
    async function fetchEquipes() {
      try {
        const data = await getMinhasEquipes();
        setEquipes(data);
      } catch (error: unknown) {
        console.error(error);
        toast.error(getErrorMessage(error, "Um erro inesperado ocorreu ao buscar equipes."));
      }
    }

    fetchEquipes()
    window.addEventListener("equipe:created", fetchEquipes as EventListener)
    window.addEventListener("equipe:updated", fetchEquipes as EventListener)

    return () => {
      window.removeEventListener("equipe:created", fetchEquipes as EventListener)
      window.removeEventListener("equipe:updated", fetchEquipes as EventListener)
    }
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleEditarEquipe = (equipe: Equipe) => { setEquipeParaEditar(equipe) };
  const handleCloseEditar = () => { setEquipeParaEditar(null) };

  const confirmarExclusao = (equipe: Equipe) => { setEquipeParaExcluir(equipe); };

  const executarExclusao = async () => {
    if (!equipeParaExcluir) return;
    try {
      await deleteEquipe(equipeParaExcluir.equId)
      setEquipes(prev => prev.filter(e => e.equId !== equipeParaExcluir.equId))
      toast.success("Equipe excluída com sucesso!")
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao excluir equipe."));
    } finally {
      setEquipeParaExcluir(null);
    }
  };

  const handleCancelExclusao = () => { setEquipeParaExcluir(null); };

  const handleSairEquipe = async (equipeId: string) => {
    try {
      const message = await sairDaEquipe(equipeId);
      toast.success(message);
      setEquipes(prev => prev.filter(e => e.equId !== equipeId));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Erro ao sair da equipe."));
    }
  };

  if (equipes.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center p-4">
        <i className="fa-solid fa-users text-5xl text-slate-300 mb-4"></i>
        <h2 className="text-xl font-bold text-slate-600">
          Nenhuma equipe cadastrada
        </h2>
        <p className="text-slate-500 mt-1 pb-2">
          Crie uma equipe para começar a organizar seus membros.
        </p>
        <button
          onClick={handleOpenModal}
          className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-800 text-white rounded-lg transition-colors"
        >
          Criar Nova Equipe
        </button>
        <ModalCriarEquipe isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center pb-2 px-4">
        <div className="mb-4 md:mb-0 flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Equipes</h1>
          <hr className="text-gray-400" />
          <p className="text-gray-500 mt-1">
            Acesse e gerencie todas as suas equipes em um só lugar.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition shadow-md hover:shadow-lg flex items-center justify-center w-full md:w-auto"
        >
          Criar Equipe
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {equipes.map((equipe, i) => (
          <TeamCard
            key={equipe.equId}
            equId={equipe.equId}
            equNome={equipe.equNome}
            equDescricao={equipe.equDescricao}
            usuarios={equipe.equMembros ?? []}
            corClasse={cores[i % cores.length]}
            onDelete={() => confirmarExclusao(equipe)}
            onEdit={() => handleEditarEquipe(equipe)}
            onLeave={handleSairEquipe}
          />
        ))}
      </div>

      <ModalCriarEquipe isOpen={isModalOpen} onClose={handleCloseModal} />

      {equipeParaEditar && (
        <ModalEditarEquipes
          isOpen={true}
          onClose={handleCloseEditar}
          equipe={{
            equId: equipeParaEditar.equId,
            equNome: equipeParaEditar.equNome,
            equDescricao: equipeParaEditar.equDescricao ?? "",
            membrosEmails: (equipeParaEditar.equMembros ?? []).map(m => m.usuEmail ?? ""),
          }}
        />
      )}

      {equipeParaExcluir && (
        <ModalConfirmacao
          titulo="Confirmar Exclusão da Equipe"
          mensagem={
            <p>
              Deseja realmente excluir a equipe{" "}
              <strong>{equipeParaExcluir.equNome}</strong>?
              <br />
              Esta ação é irreversível.
            </p>
          }
          onConfirm={executarExclusao}
          onCancel={handleCancelExclusao}
          confirmText="Sim, Excluir"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
}
