import React, { useState, useContext, useEffect } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/Calendario.css';
import { useOutletContext } from "react-router-dom";
import { ModalContext } from "@/context/ModalContext";
import ModalCriarTarefas from "../ModalCriarTarefas";
import ModalEditarTarefas from "../ModalEditarTarefas";
import ModalConfirmacao from "@/components/ui/ModalConfirmacao";
import ModalGoogle from "../ModalGoogle";
import CalendarLegenda from './CalendarioLegenda';
import CalendarioToolbar from './CalendarioToolbar';
import CalendarioComponent from './CalendarioComponent';
import { localizer, eventStyleGetter as baseEventStyleGetter } from '@/config/calendarioConfig';
import { useTarefas } from '@/hooks/useTarefas';
import type { Tarefa } from "@/types/types";
import { exchangeCode, fetchGoogleEvents, getAuthStatus, consumeOAuthCodeFromUrl, deleteGoogleEvent } from '@/services/googleCalendar';
import { toast } from 'react-toastify';

const CalendarioTarefas: React.FC = () => {
    const [view, setView] = useState<'month' | 'week'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
    const [tarefaParaExcluir, setTarefaParaExcluir] = useState<Tarefa | null>(null);
    const [showGoogleModal, setShowGoogleModal] = useState(false);
    const [isGoogleLogged, setIsGoogleLogged] = useState(false);
    const [googleEvents, setGoogleEvents] = useState<any[]>([]);

    const GOOGLE_ENABLED = import.meta.env.VITE_GOOGLE_CALENDAR_ENABLED === 'true';

    const modalContext = useContext(ModalContext);
    const { selectedProjectId } = useOutletContext<{ selectedProjectId: string | null }>();

    const {
        eventosFiltrados,
        responsaveis,
        responsavelSelecionado,
        setResponsavelSelecionado,
        loading,
        mensagemVazia,
        carregarTarefas,
        excluirTarefa
    } = useTarefas(selectedProjectId);

    useEffect(() => {
        if (!GOOGLE_ENABLED) return;
        let mounted = true;
        (async () => {
            try {
                const { loggedIn } = await getAuthStatus();
                if (!mounted) return;
                setIsGoogleLogged(loggedIn);
                if (loggedIn) {
                    await carregarEventosGoogle();
                }
            } catch {
            }
        })();
        return () => { mounted = false; };
    }, []);
    
    useEffect(() => {
        if (!GOOGLE_ENABLED) return;
        const extracted = consumeOAuthCodeFromUrl();
        if (!extracted) return;

        (async () => {
            if (extracted.error) {
                console.error('Erro OAuth Google:', extracted.error);
                return;
            }
            if (extracted.code) {
                try {
                    await exchangeCode(extracted.code);
                    setIsGoogleLogged(true);
                    await carregarEventosGoogle();
                } catch (e) {
                    console.error(e);
                    alert('Falha ao conectar com Google. Tente novamente.');
                } finally {
                    setShowGoogleModal(false);
                }
            }
        })();
    }, []);


    const carregarEventosGoogle = async () => {
        if (!GOOGLE_ENABLED) return;
        try {
            const events = await fetchGoogleEvents();
            setGoogleEvents(events);
        } catch (e) {
            console.error(e);
        }
    };

    const allEvents = React.useMemo(
        () => eventosFiltrados,
        [eventosFiltrados]
    );

    const eventStyleGetter = (event: any) => {
        return baseEventStyleGetter(event);
    };

    const handleSelectEvent = (event: any, e: any) => {
        e.preventDefault();
        setModalPosition({ x: e.clientX, y: e.clientY });
        setSelectedTask(event);
        setShowModal(true);
    };

    const handleEditTask = () => {
        if (selectedTask && modalContext) {
            const tarefaParaEditar = selectedTask.resource.tarefaCompleta;
            setShowModal(false);
            setSelectedTask(null);
            setTimeout(() => {
                modalContext.openModal(
                    <ModalEditarTarefas 
                        tarefa={tarefaParaEditar}
                        onSave={carregarTarefas}
                    />
                );
            }, 200);
        }
    };

    const handleCreateTaskSuccess = () => {
        carregarTarefas();
        window.dispatchEvent(new CustomEvent('taskUpdated', { 
            detail: { 
                action: 'created', 
                projectId: selectedProjectId,
                timestamp: Date.now()
            } 
        }));
        if (modalContext) modalContext.closeModal();

        if (isGoogleLogged) {
            setTimeout(() => {
                carregarEventosGoogle().catch(() => {});
            }, 500);
        }
    };

    const handleDeleteTask = () => {
        if (!selectedTask) return;

        setShowModal(false);

        const tarefaBase = selectedTask.resource?.tarefaCompleta as Tarefa;
        const googleEventId =
            (tarefaBase as any)?.googleId ??
            selectedTask?.resource?.googleId ??
            selectedTask?.resource?.raw?.id ??
            undefined;

        const tarefaComGoogleId = { ...(tarefaBase as any), googleId: googleEventId };
        setTarefaParaExcluir(tarefaComGoogleId); 
        setSelectedTask(null);
    };

    const executarExclusao = async (alvo?: (Tarefa & { googleId?: string }) | null) => {
        const tarefa = alvo ?? tarefaParaExcluir;
        if (!tarefa) return;

        const googleEventId = (tarefa as any)?.googleId;
        const ok = await excluirTarefa(tarefa.tarId);

        if (ok) {
            window.dispatchEvent(new CustomEvent('taskUpdated', {
                detail: {
                    action: 'deleted',
                    projectId: selectedProjectId,
                    taskId: tarefa.tarId,
                    timestamp: Date.now()
                }
            }));

            if (isGoogleLogged && googleEventId) {
                try {
                    deleteGoogleEvent(googleEventId);
                } catch (e) {
                    console.warn('Falha ao excluir evento do Google Calendar.', e);
                }
            }
        } else {
            alert('Erro ao excluir tarefa. Verifique o console para mais detalhes.');
        }

        setTarefaParaExcluir(null);

        if (isGoogleLogged) {
            setTimeout(() => {
                carregarEventosGoogle().catch(() => {});
            }, 500);
        }
    };

    const handleSelectSlot = (slotInfo: { start: Date }) => {
        if (!selectedProjectId) return;
        if (modalContext) {
            modalContext.openModal(
                <ModalCriarTarefas
                    onSuccess={handleCreateTaskSuccess}
                    statusInicial="Pendente"
                    selectedProjectId={selectedProjectId}
                    tarPrazo={slotInfo.start} 
                />
            );
        }
    };

    useEffect(() => {
        const handleTaskUpdate = (event: CustomEvent) => {
            const { action, projectId } = event.detail;
            if (projectId === selectedProjectId) {
                if (action === 'created' || action === 'deleted' || action === 'updated') {
                    carregarTarefas();
                    if (isGoogleLogged) {
                        carregarEventosGoogle().catch(() => {});
                    }
                }
            }
        };
        window.addEventListener('taskUpdated', handleTaskUpdate as EventListener);
        return () => {
            window.removeEventListener('taskUpdated', handleTaskUpdate as EventListener);
        };
    }, [selectedProjectId, carregarTarefas, isGoogleLogged]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showModal) {
                const target = event.target as HTMLElement;
                const modalElement = document.querySelector('.fixed.bg-white.shadow-lg');
                if (modalElement && !modalElement.contains(target)) {
                    setShowModal(false);
                    setSelectedTask(null);
                }
            }
        };
        if (showModal) {
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);

    const isMobile = window.innerWidth <= 768;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                    <p className="text-gray-600">Carregando calendário...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2 pb-20 sm:pb-0">
            {showModal && selectedTask && (
                <div 
                    className="fixed bg-white shadow-lg border border-gray-300 rounded-lg py-2 z-50"
                    style={{
                        left: window.innerWidth < 640 && modalPosition.x > window.innerWidth - 180 
                            ? modalPosition.x - 160 
                            : modalPosition.x,
                        top: window.innerWidth < 640 && modalPosition.y > window.innerHeight - 120 
                            ? modalPosition.y - 100 
                            : modalPosition.y,
                        minWidth: '150px'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditTask();
                        }}
                        className="w-full text-left px-3 py-2 sm:py-2 text-sm hover:bg-blue-50 text-blue-600 flex items-center gap-2 active:bg-blue-100"
                    >
                        <i className="fa-solid fa-edit"></i>
                        Editar
                    </button>
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteTask();
                        }}
                        className="w-full text-left px-3 py-2 sm:py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 active:bg-red-100"
                    >
                        <i className="fa-solid fa-trash"></i>
                        Apagar
                    </button>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-2">
                <div className="bg-white p-2">
                    <CalendarioToolbar
                        view={view}
                        setView={setView}
                        isGoogleLogged={isGoogleLogged}
                        setShowGoogleModal={setShowGoogleModal}
                        responsaveis={responsaveis}
                        responsavelSelecionado={responsavelSelecionado}
                        setResponsavelSelecionado={setResponsavelSelecionado}
                        carregarTarefas={async () => {
                            await carregarTarefas();
                            if (GOOGLE_ENABLED && isGoogleLogged) {
                                await carregarEventosGoogle();
                            }
                        }}
                    />
                </div>
                <div className="h-96 sm:h-[500px] lg:h-[650px]">
                    <CalendarioComponent
                        localizer={localizer}
                        eventosFiltrados={allEvents}
                        view={view}
                        setView={setView}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        eventStyleGetter={eventStyleGetter}
                        handleSelectEvent={handleSelectEvent}
                        handleSelectSlot={handleSelectSlot}
                        isMobile={isMobile}
                        eventosFiltradosLength={eventosFiltrados.length}
                    />
                </div>
            </div>

            <CalendarLegenda />

            {tarefaParaExcluir && (
                <ModalConfirmacao
                    titulo="Tem certeza?"
                    mensagem={
                        <p>
                            A tarefa "
                            <span className="font-bold">
                                {tarefaParaExcluir.tarTitulo}
                            </span>
                            " será excluída permanentemente.
                        </p>
                    }
                    onConfirm={() => executarExclusao()}
                    onCancel={() => setTarefaParaExcluir(null)}
                    confirmText="Excluir"
                    cancelText="Cancelar"
                />
            )}

            <ModalGoogle
                open={showGoogleModal}
                onClose={() => setShowGoogleModal(false)}
                onLoginCode={async (code: string) => {
                    try {
                        await exchangeCode(code);
                        setIsGoogleLogged(true);
                        await carregarEventosGoogle();
                    } catch (e) {
                        console.error(e);
                        toast.error('Falha ao conectar com Google. Tente novamente.');
                    } finally {
                        setShowGoogleModal(false);
                    }
                }}
            />
        </div>
    );
};

export default CalendarioTarefas;