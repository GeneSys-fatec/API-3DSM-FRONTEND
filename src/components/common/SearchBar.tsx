import { useState, useRef, useEffect } from "react";
import { mockTasks, mockUsers } from "../../utils/mockBusca";

// --- Tipos ---
type Task = {
  id: number;
  title: string;
};

type User = {
  id: number;
  name: string;
};

// --- Constantes ---
const TASK_DISPLAY_LIMIT = 5;

// --- Componente Dropdown (interno) ---
type SearchDropdownProps = {
  onTaskSelect: (taskTitle: string) => void;
};

function SearchDropdown({ onTaskSelect }: SearchDropdownProps) {
  const [showAllTasks, setShowAllTasks] = useState(false);

  const tasksToShow = showAllTasks ? mockTasks : mockTasks.slice(0, TASK_DISPLAY_LIMIT);

  return (
    <div className="absolute top-full mt-2 w-full md:w-[450px] md:right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
      <div className="p-4">
        <ul>
          {tasksToShow.map((task: Task) => (
            <li 
              key={task.id} 
              className="py-2 px-3 hover:bg-gray-100 rounded-md cursor-pointer border-b border-gray-200"
              onClick={() => onTaskSelect(task.title)}
            >
              {task.title}
            </li>
          ))}
        </ul>
        <div className="text-right mt-2">
          {!showAllTasks && mockTasks.length > TASK_DISPLAY_LIMIT && (
            <button 
              onClick={() => setShowAllTasks(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              Ver mais resultados...
            </button>
          )}
          {showAllTasks && (
            <button 
              onClick={() => setShowAllTasks(false)}
              className="text-sm text-blue-600 hover:underline"
            >
              Ver menos
            </button>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">Filtrar por responsável</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {mockUsers.map((user: User) => (
            <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
              <span className="text-gray-600">{user.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}


// --- Componente Principal SearchBar ---
type SearchBarProps = {
  variant: "desktop" | "mobile";
  isSearchVisible?: boolean;
};

export default function SearchBar({ variant, isSearchVisible }: SearchBarProps) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleTaskSelect = (taskTitle: string) => {
    setSearchTerm(taskTitle);
    setIsDropdownVisible(false);
  };

  if (variant === "desktop") {
    return (
      <div className="relative hidden md:block" ref={searchBarRef}>
        <i className="fa-solid fa-magnifying-glass absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 z-10"></i>
        <input
          type="text"
          placeholder="Busque uma tarefa..."
          className="bg-gray-50 pl-10 pr-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 rounded-3xl w-full max-w-xs h-10 transition-shadow relative"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsDropdownVisible(true)}
        />
        {isDropdownVisible && <SearchDropdown onTaskSelect={handleTaskSelect} />}
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
            placeholder="Busque uma tarefa..."
            className="bg-gray-50 pl-10 pr-10 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 rounded-3xl w-full h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <SearchDropdown onTaskSelect={handleTaskSelect} />
            </div>
        )}
      </div>
    );
  }

  return null;
}
