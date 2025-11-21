import { useState, useRef, useEffect } from "react";

interface MenuColunaProps {
  corAtual: string;
  onMudarCor: (novaCor: { corClasse: string; corFundo: string }) => void;
  onApagarColuna: () => void;
  isConcluida: boolean;
}

export default function MenuColuna({
  corAtual,
  onMudarCor,
  onApagarColuna,
  isConcluida
}: MenuColunaProps) {
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const paletaDeCores = [
    { corClasse: "orange-400", corFundo: "bg-orange-400/35" },
    { corClasse: "blue-400", corFundo: "bg-blue-400/40" },
    { corClasse: "green-500", corFundo: "bg-green-500/40" },
    { corClasse: "purple-400", corFundo: "bg-purple-400/35" },
    { corClasse: "red-400", corFundo: "bg-red-400/35" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }

    if (aberto) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [aberto]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center justify-center w-7 h-7 text-gray-600/70 hover:text-gray-900 hover:bg-black/10 rounded-full transition-all duration-200"
        aria-label="Menu de coluna"
      >
        <i className="fa-solid fa-ellipsis-vertical fa-lg"></i>
      </button>

      {aberto && (
        <div className="flex flex-col gap-3 absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-xl p-3 z-20">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            Cor da coluna
          </h4>

          <div className="flex gap-2 mb-3">
            {paletaDeCores.map((cor) => (
              <button
                key={cor.corClasse}
                className={`w-6 h-6 rounded-full bg-${cor.corClasse} border-2 ${
                  corAtual === cor.corClasse
                    ? "border-black"
                    : "border-transparent hover:border-gray-400"
                }`}
                onClick={() => {
                  onMudarCor({
                    corClasse: cor.corClasse,
                    corFundo: cor.corFundo,
                  });
                  setAberto(false);
                }}
              ></button>
            ))}
          </div>
          {!isConcluida && (
              <button
              onClick={() => {
                onApagarColuna();
                setAberto(false);
              }}
              className="w-full text-red-600 hover:text-red-800 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <i className="fa-solid fa-trash-can"></i> Apagar coluna
              </button>
          )}
        </div>
      )}
    </div>
  );
}
