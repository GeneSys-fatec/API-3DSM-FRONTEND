interface ModalConfirmacaoProps {
  titulo: string;
  mensagem: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ModalConfirmacao({
  titulo,
  mensagem,
  onConfirm,
  onCancel,
  confirmText = "Excluir",
  cancelText = "Cancelar",
}: ModalConfirmacaoProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="text-center">
          <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{titulo}</h3>
          <div className="text-gray-600">{mensagem}</div>
          <div className="flex gap-4 justify-center pt-5">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}