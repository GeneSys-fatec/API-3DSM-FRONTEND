import React, { useState, useEffect, useContext } from "react";
import { ModalContext } from "@/context/ModalContext.tsx";
import { toast } from "react-toastify";
import FormularioTarefa from "./FormularioTarefa";
import type { Tarefa, Usuario, Anexo } from "@/types/types";
import { authFetch } from "@/utils/api";
import { getFileIcon } from "@/utils/fileUtils";
import {
  showErrorToastFromResponse,
  showValidationToast,
} from "@/utils/errorUtils";
import { uploadTaskAttachments } from "@/utils/taskUtils";
import ListaComentarios from "./ListaComentarios";
import imageCompression from "browser-image-compression";
import ModalConfirmacao from "../../ui/ModalConfirmacao";
import {
  getAuthStatus,
  updateGoogleEvent,
  buildGoogleEventBodyFromTask,
} from "@/services/googleCalendar";

type AnexoParaExcluir = {
  nome: string;
} | null;
interface ModalEditarTarefasProps {
  tarefa: Tarefa;
  onSave: () => void;
}

export default function ModalEditarTarefas({
  tarefa: tarefaInicial,
  onSave,
}: ModalEditarTarefasProps) {
  const modalContext = useContext(ModalContext);
  const [tarefa, setTarefa] = useState<Partial<Tarefa>>(tarefaInicial);
  const [novosAnexos, setNovosAnexos] = useState<File[]>([]);
  const [anexosExistentes, setAnexosExistentes] = useState<Anexo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitRef = React.useRef<number>(0);
  const submittingRef = React.useRef<boolean>(false);

  const projId = tarefaInicial.projId;
  const [visualizaImagemUrl, setVisualizaImagemUrl] = useState<string | null>(
    null
  );

  const [anexoParaExcluir, setAnexoParaExcluir] =
    useState<AnexoParaExcluir>(null);

  useEffect(() => {
    if (projId) {
      //
      authFetch(`http://localhost:8080/projeto/${projId}/membros`) //
        .then((res) => res.json())
        .then(setUsuarios)
        .catch((err) =>
          console.error("Erro ao buscar usuários do projeto:", err)
        );
    } else {
      console.warn("ID do projeto não fornecido para o modal de edição.");
    }

    authFetch(`http://localhost:8080/tarefa/${tarefaInicial.tarId}/anexos`) //
      .then((res) => res.json())
      .then(setAnexosExistentes)
      .catch((err) => console.error("Erro ao buscar anexos:", err));
  }, [tarefaInicial.tarId, projId]);

  const MAX_FILES = 10;
  const MAX_TOTAL_BYTES = 30 * 1024 * 1024;
  const MAX_BYTES_COMPRESSIVE = 20 * 1024 * 1024;
  const MAX_BYTES_NON_COMPRESSIVE = 2 * 1024 * 1024;
  const COMPRESS_THRESHOLD = 2 * 1024 * 1024;

  const isImage = (f: File) =>
    f.type.match(/^image\/(jpeg|jpg|png)$/i) || /\.(jpe?g|png)$/i.test(f.name);
  const isPdf = (f: File) =>
    f.type === "application/pdf" || /\.pdf$/i.test(f.name);
  const isDocx = (f: File) =>
    f.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    /\.docx$/i.test(f.name);
  const isXlsx = (f: File) =>
    f.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    /\.xlsx$/i.test(f.name);
  const isAllowed = (f: File) =>
    isImage(f) || isPdf(f) || isDocx(f) || isXlsx(f);

  async function tryCompressFile(file: File): Promise<File> {
    if (!isImage(file) && !isPdf(file)) return file;
    if (file.size <= COMPRESS_THRESHOLD) return file;

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.7,
      });

      console.log(`Original: ${file.size} bytes`);
      console.log(`Comprimido: ${compressed.size} bytes`);

      return compressed.size < file.size ? compressed : file;
    } catch (err) {
      console.warn(`Falha ao comprimir ${file.name}:`, err);
      return file;
    }
  }

  async function validateAndCompressFiles(
    newFiles: File[],
    currentFiles: File[] = []
  ) {
    const errors: string[] = [];
    const accepted: File[] = [];

    if (currentFiles.length + newFiles.length > MAX_FILES) {
      errors.push(`Máximo de ${MAX_FILES} arquivos por tarefa.`);
    }

    const signature = (f: File) => `${f.name}|${f.size}|${f.lastModified}`;
    const existingSign = new Set(currentFiles.map(signature));

    for (let f of newFiles) {
      if (!isAllowed(f)) {
        errors.push(`Tipo não permitido: ${f.name}`);
        continue;
      }

      if (isImage(f) || isPdf(f)) {
        f = await tryCompressFile(f);
      }

      const sizeLimit =
        isImage(f) || isPdf(f)
          ? MAX_BYTES_COMPRESSIVE
          : MAX_BYTES_NON_COMPRESSIVE;
      if (f.size > sizeLimit) {
        errors.push(
          `${f.name}: tamanho excede o limite de ${Math.round(
            sizeLimit / 1024 / 1024
          )}MB.`
        );
        continue;
      }

      if (existingSign.has(signature(f))) {
        errors.push(`Arquivo já adicionado: ${f.name}`);
        continue;
      }

      accepted.push(f);
    }

    const totalBytes =
      currentFiles.reduce((a, f) => a + f.size, 0) +
      accepted.reduce((a, f) => a + f.size, 0);

    if (totalBytes > MAX_TOTAL_BYTES) {
      errors.push("Tamanho total dos anexos excede 30MB.");
    }

    return { accepted, errors };
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const novos = Array.from(e.target.files || []);
    const { accepted, errors } = await validateAndCompressFiles(
      novos,
      novosAnexos
    );
    if (errors.length > 0) showValidationToast(errors, "Anexos inválidos");
    if (accepted.length > 0) setNovosAnexos((prev) => [...prev, ...accepted]);
    e.target.value = "";
  };

  const handleRemoveNovoAnexo = (fileToRemove: File) => {
    setNovosAnexos((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const handleRemoverAnexoExistente = (nomeArquivo: string) => {
    setAnexoParaExcluir({ nome: nomeArquivo });
  };

  const executarExclusaoAnexo = async () => {
    if (!anexoParaExcluir || !tarefa.tarId) return;
    const nomeArquivo = anexoParaExcluir.nome;

    setAnexoParaExcluir(null);

    try {
      await authFetch(
        `http://localhost:8080/tarefa/${
          tarefa.tarId
        }/anexos/${encodeURIComponent(nomeArquivo)}`,
        { method: "DELETE", credentials: "include" }
      );
      setAnexosExistentes((prev) =>
        prev.filter((a) => a.arquivoNome !== nomeArquivo)
      );
      toast.success("Anexo removido.");
    } catch (err) {
      console.error("Falha ao remover anexo:", err);
      toast.error("Erro ao remover anexo.");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submittingRef.current) return;

    const now = Date.now();
    if (now - lastSubmitRef.current < 2000) return;
    lastSubmitRef.current = now;

    const validationErrors: string[] = [];
    if (!tarefa.tarTitulo?.trim())
      validationErrors.push("O título da tarefa é obrigatório.");
    if (!tarefa.responsaveis || tarefa.responsaveis.length === 0) {
      validationErrors.push("Selecione ao menos um responsável pela tarefa.");
    }
    if (!tarefa.tarPrazo)
      validationErrors.push("Informe um prazo para a tarefa.");

    if (validationErrors.length > 0) {
      showValidationToast(validationErrors, "Erros de validação");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    const { accepted, errors: anexErrors } = await validateAndCompressFiles(
      novosAnexos,
      []
    );
    if (anexErrors.length > 0) {
      showValidationToast(anexErrors, "Anexos inválidos");
      setIsSubmitting(false);
      submittingRef.current = false;
      return;
    }

    try {
      const res = await authFetch(
        `http://localhost:8080/tarefa/atualizar/${tarefa.tarId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tarefa),
          credentials: "include",
        }
      );

      if (!res.ok) {
        await showErrorToastFromResponse(res, "Erro ao atualizar a tarefa");
        return;
      }

      if (accepted.length > 0) {
        const ok = await uploadTaskAttachments(String(tarefa.tarId), accepted);
        if (!ok) {
          toast.error("Falha ao anexar novos arquivos.");
          return;
        }
      }

      try {
        const { loggedIn } = await getAuthStatus();
        if (loggedIn) {
          const googleEventId =
            (tarefa as any)?.googleId || (tarefaInicial as any)?.googleId;
          if (googleEventId && tarefa.tarTitulo && tarefa.tarPrazo) {
            const eventBody = buildGoogleEventBodyFromTask({
              tarTitulo: tarefa.tarTitulo,
              tarDescricao: tarefa.tarDescricao,
              tarPrazo: tarefa.tarPrazo as any,

              tarPrazoFim: (tarefa as any)?.tarPrazoFim,
            });
            await updateGoogleEvent(String(googleEventId), eventBody);
          }
        }
      } catch (e) {
        console.warn("Falha ao sincronizar atualização no Google Calendar:", e);
      }

      toast.success("Tarefa atualizada com sucesso!");
      onSave();
      modalContext?.closeModal();
    } catch (error) {
      console.error("Falha ao atualizar tarefa:", error);
      toast.error("Erro ao atualizar a tarefa.");
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-8 pb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Editar Tarefa</h2>
          <button
            onClick={() => modalContext?.closeModal()}
            className="text-gray-400 hover:text-gray-600 text-3xl"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-grow overflow-hidden"
        >
          <div className="px-8 flex-grow overflow-y-auto">
            <FormularioTarefa
              tarefa={tarefa}
              setTarefa={setTarefa}
              usuarios={usuarios}
              anexos={novosAnexos}
              anexosExistentes={anexosExistentes}
              handleFileChange={handleFileChange}
              handleRemoveAnexo={handleRemoveNovoAnexo}
              handleRemoverAnexoExistente={handleRemoverAnexoExistente}
              onVisualizaImagem={setVisualizaImagemUrl}
            />
            <div className="flex-grow overflow-y-auto pt-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Comentários
                </h3>
                {tarefa.tarId && <ListaComentarios tarId={tarefa.tarId} />}
              </div>
            </div>

          </div>

          <div className="p-8 pt-4 flex justify-end gap-x-4">
            <button
              type="button"
              onClick={() => modalContext?.closeModal()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
      {anexoParaExcluir && (
        <ModalConfirmacao
          titulo={"Excluir Anexo?"}
          mensagem={
            <p>
              O anexo "
              <span className="font-bold">{anexoParaExcluir.nome}</span>" será
              excluído permanentemente.
            </p>
          }
          onConfirm={executarExclusaoAnexo}
          onCancel={() => setAnexoParaExcluir(null)}
        />
      )}

      {visualizaImagemUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-4"
          onClick={() => setVisualizaImagemUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl font-bold"
            onClick={() => setVisualizaImagemUrl(null)}
          >
            &times;
          </button>
          <img
            src={visualizaImagemUrl}
            alt="Visualização ampliada do anexo"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
