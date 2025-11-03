import React, { useState, useEffect, useRef } from "react";
import { getFileIcon } from "@/utils/fileUtils";
// <<< MUDANÇA: Importar ResponsavelTarefa e ícones
import type { Tarefa, Usuario, Anexo, ResponsavelTarefa } from "@/types/types";
import { authFetch } from "@/utils/api";
import { X, ChevronDown, Search } from "lucide-react";

interface FormularioTarefaProps {
  tarefa: Partial<Tarefa>;
  setTarefa: React.Dispatch<React.SetStateAction<Partial<Tarefa>>>;
  usuarios: Usuario[];
  anexos: File[];
  anexosExistentes?: Anexo[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveAnexo: (file: File) => void;
  handleRemoverAnexoExistente?: (nomeArquivo: string) => void;
  onVisualizaImagem?: (url: string) => void;
  selectedProjectId?: string; // novo: projId para carregar colunas/status
}

async function baixarAnexo(tarefaId: string, nomeArquivo: string) {
  try {
    const res = await authFetch(
      `http://localhost:8080/tarefa/${tarefaId}/anexos/${encodeURIComponent(
        nomeArquivo
      )}`
    );
    if (!res.ok) throw new Error("Erro ao baixar anexo");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Falha ao baixar o anexo.");
  }
}

// --- NOVO COMPONENTE DE PÍLULA DE AVATAR ---
const AvatarPill: React.FC<{
  responsavel: ResponsavelTarefa;
  onRemove: (e?: React.MouseEvent) => void;
}> = ({ responsavel, onRemove }) => (
  <div
    className="flex items-center gap-1.5 bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 text-sm font-medium"
    title={responsavel.usuNome}
  >
    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold border-2 border-indigo-100">
      {responsavel.usuNome?.charAt(0)?.toUpperCase() || "?"}
    </span>
    <span className="truncate max-w-[100px]">{responsavel.usuNome}</span>
    <button
      type="button"
      onClick={onRemove}
      className="text-indigo-500 hover:text-indigo-700"
    >
      <X size={14} />
    </button>
  </div>
);

// --- NOVO COMPONENTE DE MULTI-SELECT ---
const MultiSelectResponsaveis: React.FC<{
  usuarios: Usuario[];
  selecionados: ResponsavelTarefa[];
  onChange: (novosSelecionados: ResponsavelTarefa[]) => void;
}> = ({ usuarios, selecionados, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filtro, setFiltro] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleUsuario = (usuario: Usuario) => {
    const jaSelecionado = selecionados.some((r) => r.usuId === usuario.usuId);
    if (jaSelecionado) {
      // Remove
      onChange(selecionados.filter((r) => r.usuId !== usuario.usuId));
    } else {
      const novoResponsavel: ResponsavelTarefa = {
        usuId: usuario.usuId,
        usuNome: usuario.usuNome,
      };
      onChange([...selecionados, novoResponsavel]);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.usuNome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="border border-gray-300 rounded-md p-2 min-h-[42px] flex flex-wrap gap-2 items-center cursor-pointer shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selecionados.length === 0 && (
          <span className="text-gray-400 px-1.5">Selecione um ou mais...</span>
        )}
        {selecionados.map((r) => (
          <AvatarPill
            key={r.usuId}
            responsavel={r}
            onRemove={(e) => {
              e?.stopPropagation(); // Impede que o clique feche o dropdown
              handleToggleUsuario(r as Usuario); // Reutiliza a lógica
            }}
          />
        ))}
        <ChevronDown
          size={18}
          className={`ml-auto text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar por nome..."
                className="w-full border-gray-300 rounded-md pl-8 pr-2 py-1.5 text-sm"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <Search
                size={16}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
          <ul className="overflow-y-auto flex-1">
            {usuariosFiltrados.length > 0 ? (
              usuariosFiltrados.map((usuario) => (
                <li
                  key={usuario.usuId}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                  onClick={() => handleToggleUsuario(usuario)}
                >
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    checked={selecionados.some(
                      (r) => r.usuId === usuario.usuId
                    )}
                    readOnly
                  />
                  <span>{usuario.usuNome}</span>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 text-sm">
                Nenhum usuário encontrado.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function FormularioTarefa({
  tarefa,
  setTarefa,
  usuarios,
  anexos,
  anexosExistentes,
  handleFileChange,
  handleRemoveAnexo,
  handleRemoverAnexoExistente,
  onVisualizaImagem,
  selectedProjectId,
}: FormularioTarefaProps) {
  const [colunas, setColunas] = useState<any[]>([]);

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
        const normalized = (data || []).map((it: any, i: number) => ({
          id: it.colId || it.id || `col-${i}`,
          titulo: it.colTitulo || it.titulo || it.Titulo || "",
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTarefa((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files || []);
    console.log("Arquivos selecionados:", arquivos);
    handleFileChange(e);
  };

  const totalAnexosCount =
    (anexosExistentes?.length || 0) + (anexos?.length || 0);

  return (
    <>
      <div className="flex flex-col gap-y-6">
        <div>
          <label
            htmlFor="tarTitulo"
            className="py-2 block text-sm font-medium text-gray-700"
          >
            Título da Tarefa
          </label>
          <input
            type="text"
            id="tarTitulo"
            name="tarTitulo"
            value={tarefa.tarTitulo || ""}
            onChange={handleChange}
            placeholder="Título da Tarefa"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
          />
        </div>

        <div>
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-white p-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <span>Anexar Arquivos ({totalAnexosCount})</span>
            <input
              id="file-upload"
              name="anexo"
              type="file"
              className="sr-only"
              onChange={handleInputChange}
              multiple
            />
          </label>
        </div>

        {((anexosExistentes && anexosExistentes.length > 0) ||
          (anexos && anexos.length > 0)) && (
          <div className="mt-2 p-4 border border-dashed rounded-md bg-gray-50 max-h-40 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Anexos ({totalAnexosCount}):
            </h4>
            <ul className="space-y-3">
              {anexosExistentes?.map((anexo) => {
                const anexoUrl = `http://localhost:8080/anexos/${encodeURIComponent(
                  anexo.arquivoNome
                )}`;
                const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(
                  anexo.arquivoNome
                );
                return (
                  <li
                    key={`existente-${anexo.arquivoNome}`}
                    className="text-sm gap-1"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-2 flex-grow min-w-0">
                        <a
                          href={anexoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                          title={`Abrir ${anexo.arquivoNome} em nova aba`}
                        >
                          {getFileIcon(anexo.arquivoTipo || "")}
                          <span className="truncate">{anexo.arquivoNome}</span>
                        </a>
                        {isImage && (
                          <div className="mt-1">
                            <img
                              src={anexoUrl}
                              alt={`Preview de ${anexo.arquivoNome}`}
                              className="max-w-full h-auto max-h-32 rounded-md border object-contain cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                onVisualizaImagem && onVisualizaImagem(anexoUrl)
                              }
                            />
                          </div>
                        )}
                      </div>
                      {handleRemoverAnexoExistente && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoverAnexoExistente(anexo.arquivoNome)
                          }
                          className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
              {anexos.map((file, index) => (
                <li
                  key={`novo-${file.name}-${index}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {getFileIcon(file.type || file.name.split(".").pop() || "")}
                    <span className="truncate" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAnexo(file)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label
            htmlFor="tarDescricao"
            className="block text-sm font-medium text-gray-700"
          >
            Descrição
          </label>
          <textarea
            id="tarDescricao"
            name="tarDescricao"
            value={tarefa.tarDescricao || ""}
            onChange={handleChange}
            rows={3}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-24 p-2"
          ></textarea>
        </div>

        <div className="bg-white border mt-2 flex flex-col gap-6 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800">Detalhes</h3>
          <hr />
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm p-2"
                name="tarStatus"
                value={
                  tarefa.tarStatus ||
                  (colunas.length > 0 ? colunas[0].titulo : "Pendente")
                }
                onChange={handleChange}
              >
                {colunas.length > 0 ? (
                  colunas.map((c) => (
                    <option key={c.id} value={c.titulo}>
                      {c.titulo}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Pendente">Pendente</option>
                    <option value="Em Desenvolvimento">Em Desenvolvimento</option>
                    <option value="Concluída">Concluída</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Responsáveis
              </label>
              <MultiSelectResponsaveis
                usuarios={usuarios}
                selecionados={tarefa.responsaveis || []}
                onChange={(novosResponsaveis) => {
                  setTarefa((prev) => ({
                    ...prev,
                    responsaveis: novosResponsaveis,
                  }));
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Prioridade
              </label>
              <select
                className="block w-full rounded-md border-gray-400 shadow-sm p-2"
                name="tarPrioridade"
                value={tarefa.tarPrioridade || "Média"}
                onChange={handleChange}
              >
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de entrega
              </label>
              <input
                type="date"
                className="block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-500"
                name="tarPrazo"
                value={tarefa.tarPrazo || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}