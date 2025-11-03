import React from 'react';
import CalendarioTarefas from '../components/features/tasks/calendario/CalendarioTarefas';

const Calendario: React.FC = () => {
    return (
            <div className="flex-1 p-4 md:p-6 overflow-auto">
                <div className="mx-2 md:mx-4 h-full">
                    <CalendarioTarefas />
                </div>
            </div>
    );
};

export default Calendario;