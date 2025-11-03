import React, { useState, useEffect, useContext } from "react";
import { ModalContext } from "@/context/ModalContext";
import { toast } from "react-toastify";
import FormularioTarefa from "./FormularioTarefa";
import type { Tarefa, Usuario, ResponsavelTarefa, Coluna } from "@/types/types";
import { authFetch } from "@/utils/api";
import {
  showErrorToastFromResponse,
  showValidationToast,
} from "@/utils/errorUtils";
import { uploadTaskAttachments } from "@/utils/taskUtils";
import imageCompression from "browser-image-compression";
import {
  getAuthStatus,
  createGoogleEventFromTask,
} from "@/services/googleCalendar";

interface ModalCriarTarefasProps {
  onSuccess: () => void;
  statusInicial: string;
  selectedProjectId: string;
  tarPrazo?: Date | string;
}

const estadoInicial: Partial<Tarefa> = {
  tarTitulo: "",
  tarDescricao: "",
  responsaveis: [],
  tarPrioridade: "Média",
  tarPrazo: "",
};

export default function ModalCriarTarefas({
  onSuccess,
  statusInicial,
  selectedProjectId,
  tarPrazo,
}: ModalCriarTarefasProps) {
  const modalContext = useContext(ModalContext);
  const [tarefa, setTarefa] = useState<Partial<Tarefa>>({
    ...estadoInicial,
    tarStatus: statusInicial,
    tarPrazo: tarPrazo
      ? typeof tarPrazo === "string"
        ? tarPrazo.slice(0, 10)
        : tarPrazo.toISOString().slice(0, 10)
      : "",
  });
  const [anexos, setAnexos] = useState<File[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [colunas, setColunas] = useState<Coluna[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitRef = React.useRef<number>(0);
  const submittingRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (selectedProjectId) {
      authFetch(`http://localhost:8080/projeto/${selectedProjectId}/membros`)
        .then((res) => res.json())
        .then((data) => setUsuarios(data))
        .catch((err) =>
          console.error("Erro ao buscar usuários do projeto:", err)
        );
    }
  }, [selectedProjectId]);

  useEffect(() => {
    const projId = selectedProjectId || (tarefa?.projId as string | undefined);
    if (!projId) {
      setColunas([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await authFetch(
          `http://localhost:8080/colunas/por-projeto/${projId}`
        );
        if (!res.ok) {
          setColunas([]);
          return;
        }
        const data = await res.json();

        const normalized: Coluna[] = (data || []).map((it: any, i: number) => ({
          id: it.colId || it.id || it.Id || `col-${i}`,
          titulo: it.colTitulo || it.titulo || it.Titulo || "",
          ordem: it.colOrdem ?? it.ordem ?? i,
          corClasse: "",
          corFundo: "",
        }));
        if (mounted) setColunas(normalized);
      } catch (err) {
        console.error("Erro ao carregar colunas:", err);
        if (mounted) setColunas([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedProjectId, tarefa?.projId]);

  const MAX_FILES = 10;
  const MAX_TOTAL_BYTES = 30 * 1024 * 1024;
  const MAX_BYTES_COMPRESSIVE = 20 * 1024 * 1024;
  const MAX_BYTES_NON_COMPRESSIVE = 2 * 1024 * 1024;

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

    for (const f of newFiles) {
      if (!isAllowed(f)) {
        errors.push(`Tipo não permitido: ${f.name}`);
        continue;
      }

      const sizeLimit =
        isImage(f) || isPdf(f)
          ? MAX_BYTES_COMPRESSIVE
          : MAX_BYTES_NON_COMPRESSIVE;

      if (existingSign.has(signature(f))) {
        errors.push(`Arquivo já adicionado: ${f.name}`);
        continue;
      }

      let finalFile = f;

      if (isImage(f) && f.size > MAX_BYTES_NON_COMPRESSIVE) {
        try {
          const compressed = await imageCompression(f, {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });

          if (compressed.size > sizeLimit) {
            errors.push(
              `${f.name}: mesmo após compressão excede o limite de ${(
                sizeLimit /
                (1024 * 1024)
              ).toFixed(1)} MB`
            );
            continue;
          }

          finalFile = new File([compressed], f.name, { type: f.type });
        } catch (err) {
          console.error("Erro ao comprimir arquivo:", err);
          errors.push(`Falha ao comprimir ${f.name}`);
          continue;
        }
      } else if (f.size > sizeLimit) {
        errors.push(`${f.name}: tamanho excede o limite permitido`);
        continue;
      }

      accepted.push(finalFile);
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
    const { accepted, errors } = await validateAndCompressFiles(novos, anexos);
    if (errors.length > 0) showValidationToast(errors, "Anexos inválidos");
    if (accepted.length > 0) setAnexos((prev) => [...prev, ...accepted]);
    e.target.value = "";
  };

  const handleRemoveAnexo = (fileToRemove: File) => {
    setAnexos((prev) => prev.filter((file) => file !== fileToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const now = Date.now();
    if (now - lastSubmitRef.current < 800) return;
    lastSubmitRef.current = now;

    const validationErrors: string[] = [];
    if (!selectedProjectId)
      validationErrors.push("ID do projeto não encontrado.");
    if (!tarefa.tarTitulo?.trim())
      validationErrors.push("O título da tarefa é obrigatório.");
    if (!tarefa.responsaveis || tarefa.responsaveis.length === 0) {
      validationErrors.push("Selecione ao menos um responsável pela tarefa.");
    }
    if (!tarefa.tarPrazo)
      validationErrors.push("Informe um prazo para a tarefa.");

    const { errors: anexErrors } = await validateAndCompressFiles(anexos, []);
    if (anexErrors.length > 0) validationErrors.push(...anexErrors);

    if (validationErrors.length > 0) {
      showValidationToast(validationErrors, "Erros de validação");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const res = await authFetch("http://localhost:8080/tarefa/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tarefa, projId: selectedProjectId }),
      });

      if (!res.ok) {
        await showErrorToastFromResponse(res, "Erro ao criar a tarefa");
        return;
      }

      const tarefaCriada = await res.json();

      if (anexos.length > 0) {
        const ok = await uploadTaskAttachments(tarefaCriada.tarId, anexos);
        if (!ok) return;
      }

      try {
        const { loggedIn } = await getAuthStatus();
        if (loggedIn) {
          await createGoogleEventFromTask({
            googleId: tarefaCriada.googleId,
            tarTitulo: tarefaCriada.tarTitulo,
            tarDescricao: tarefaCriada.tarDescricao,
            tarPrazo: tarefaCriada.tarPrazo,
            tarPrazoFim: tarefaCriada.tarPrazoFim,
          });
        }
      } catch (e) {
        console.warn("Falha ao criar evento no Google Calendar:", e);
      }

      toast.success("Tarefa criada com sucesso!");
      onSuccess();
      modalContext?.closeModal();
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao criar a tarefa.");
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="p-8 pb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Adicionar Nova Tarefa
          </h2>
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
              anexos={anexos}
              handleFileChange={handleFileChange}
              handleRemoveAnexo={handleRemoveAnexo}
              selectedProjectId={selectedProjectId}
            />
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
              {isSubmitting ? "Criando..." : "Criar Tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
