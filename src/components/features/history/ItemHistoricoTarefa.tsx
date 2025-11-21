import { useEffect, useState } from "react";
import { formatDateTime } from "@/utils/parseDateTime";
import { authFetch } from "@/utils/api";
type AcaoHistorico = "Add" | "Update" | "Delete" | "Create";

interface Editor {
  usuId: string;
  usuEmail: string;
  usuNome: string;
}

interface Alteracao {
  altId: string;
  altAcao: AcaoHistorico;
  altTipo: string;
  altEditor: Editor;
  altDataHora: string | Date | null;
  altDataHoraRaw?: { data: string; hora: string };
}

interface ItemHistoricoProps {
  tarefaNome: string;
  alteracoes: Alteracao[];
  abertoPorPadrao?: boolean;
}

function getEstiloAcao(acao: AcaoHistorico): string {
  switch (acao) {
    case 'Add':
      return 'bg-green-100 text-green-800';
    case 'Create':
      return 'bg-blue-100 text-blue-800';
    case 'Update':
      return 'bg-yellow-100 text-yellow-800';
    case 'Delete':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function ItemHistoricoTarefa({
  tarefaNome,
  alteracoes,
  abertoPorPadrao = false,
}: ItemHistoricoProps) {
  
  const [isOpen, setIsOpen] = useState(abertoPorPadrao);
  const [editorEmail, setEditorEmail] = useState<Record<string,string>>({});

  useEffect(() => {
    let mounted = true;
    const idsToFetch = new Set<string>();

    alteracoes.forEach(a => {
      const editor = a.altEditor;
      if (!editor) return;
      const name = String(editor.usuNome || "");
      const email = String(editor.usuEmail || "");
      const idFromName = name.match(/([0-9a-fA-F]{6,})/)?.[1];
      const idFromEmail = email.match(/([0-9a-fA-F]{6,})/)?.[1];
      const looksLikePlaceholderName = /^Usuário\s+[0-9a-fA-F]{6,}$/.test(name) || /^[0-9a-fA-F]{6,}$/.test(name);
      const looksLikePlaceholderEmail = /^Usuário\s+[0-9a-fA-F]{6,}$/.test(email) || /^[0-9a-fA-F]{6,}$/.test(email);
      const id = editor.usuId || idFromName || idFromEmail;
      if (id && (looksLikePlaceholderName || looksLikePlaceholderEmail)) idsToFetch.add(id);
    });

    if (idsToFetch.size === 0) return;

    (async () => {
      const fetched: Record<string,string> = {};
      for (const id of idsToFetch) {
        try {
          const res = await authFetch(`/usuario/${id}`, { method: "GET" });
          if (!res.ok) continue;
          const json = await res.json();
          fetched[id] = json.usuEmail || json.email || json.usuNome || `Usuário ${id}`;
        } catch {
        }
      }
      if (mounted && Object.keys(fetched).length) {
        setEditorEmail(prev => ({ ...prev, ...fetched }));
      }
    })();

    return () => { mounted = false; };
  }, [alteracoes]);
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200/75">
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full p-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      >
        <h2 className="text-lg font-bold text-gray-800 truncate pr-4">
          {tarefaNome}
        </h2>
        <i
          className={`fa-solid fa-chevron-down text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        ></i>
      </button>

      
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        <div className="border-t border-gray-200">
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ação</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Editor</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alteracoes.map((alt) => {
                  const editor = alt.altEditor;
                  const displayEmail = (editor && editor.usuId && editorEmail[editor.usuId]) ||
                    editor?.usuEmail ||
                    editor?.usuNome ||
                    editor?.usuId ||
                    "Usuário desconhecido";
                  const displayDateTime = alt.altDataHoraRaw && (alt.altDataHoraRaw.data || alt.altDataHoraRaw.hora)
                    ? `${alt.altDataHoraRaw.data}${alt.altDataHoraRaw.hora ? ' ' + alt.altDataHoraRaw.hora : ''}`
                    : formatDateTime(alt.altDataHora);
                  return (
                  <tr key={alt.altId} className="hover:bg-gray-50">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstiloAcao(alt.altAcao)}`}
                      >
                        {alt.altAcao}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {alt.altTipo}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap" title={alt.altEditor.usuEmail}>
                      {displayEmail}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500 whitespace-nowrap">
                      {displayDateTime}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}