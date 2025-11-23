import { useState, useRef, useEffect } from "react";


type SearchBarProps = {
  variant: "desktop" | "mobile";
  isSearchVisible?: boolean;


  termo: string;
  setTermo: (t: string) => void;
  idsResponsaveis: string[];
  setIdsResponsaveis: (ids: string[]) => void;
  usuariosDoProjeto: { id: string; name: string }[];
};

function SearchDropdown({
  idsResponsaveis,
  setIdsResponsaveis,
  usuariosDoProjeto = []
}: {
  idsResponsaveis: string[],
  setIdsResponsaveis: (ids: string[]) => void,
  usuariosDoProjeto: any[]
}) {


  const handleCheckboxChange = (userId: string) => {
    if (idsResponsaveis.includes(userId)) {
      setIdsResponsaveis(idsResponsaveis.filter(id => id !== userId));
    } else {
      setIdsResponsaveis([...idsResponsaveis, userId]);
    }
  };

  return (
    <div className="absolute top-full mt-2 w-full md:w-[300px] md:right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
      <div className="p-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">Filtrar por responsável</h3>
        <div className="grid grid-cols-1 gap-y-2">
          {usuariosDoProjeto?.map((user) => (
            <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-7 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={idsResponsaveis.includes(user.id)}
                onChange={() => handleCheckboxChange(user.id)}
              />
              <span className="text-gray-600">{user.name}</span>
            </label>
          ))}
          {usuariosDoProjeto.length === 0 && <span className="text-xs text-gray-400">Nenhum membro encontrado.</span>}
        </div>
      </div>
    </div>
  );
}


export default function SearchBar({
  variant,
  isSearchVisible,
  termo,
  setTermo,
  idsResponsaveis,
  setIdsResponsaveis,
  usuariosDoProjeto
}: SearchBarProps) {

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchBarRef]);


  if (variant === "desktop") {
    return (
      <div className="relative hidden md:block" ref={searchBarRef}>
        <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 z-10"></i>
        <input
          type="text"
          placeholder="Busque por título..."
          className="bg-gray-50 pl-10 pr-10 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 rounded-3xl w-full max-w-xs h-10 transition-shadow relative"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onFocus={() => setIsDropdownVisible(true)}
        />
        <button
          onClick={() => setIsDropdownVisible(!isDropdownVisible)}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-blue-600"
          title="Filtrar"
        >
          <i className="fa-solid fa-filter"></i>
        </button>

        {isDropdownVisible && (
          <SearchDropdown
            idsResponsaveis={idsResponsaveis}
            setIdsResponsaveis={setIdsResponsaveis}
            usuariosDoProjeto={usuariosDoProjeto}
          />
        )}
      </div>
    );
  }

  if (variant === "mobile" && isSearchVisible) {
    return (
      <div className="p-4 pt-0 md:hidden animate-fade-in" ref={searchBarRef}>
        <div className="relative w-full">
          <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Busque por título..."
            className="bg-gray-50 pl-10 pr-10 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 rounded-3xl w-full h-10"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Filtrar"
          >
            <i className={`fa-solid fa-chevron-down transition-transform ${isDropdownVisible ? 'rotate-180' : ''}`}></i>
          </button>
        </div>
        {isDropdownVisible && (
          <div className="relative mt-2">
            <SearchDropdown
              idsResponsaveis={idsResponsaveis}
              setIdsResponsaveis={setIdsResponsaveis}
              usuariosDoProjeto={usuariosDoProjeto}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}