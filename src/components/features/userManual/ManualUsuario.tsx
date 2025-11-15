import React, { useState } from "react";

type SectionKey =
    | "overview"
    | "tasks"
    | "teams"
    | "projects"
    | "kanban"
    | "list"
    | "metrics"
    | "calendar"
    | "profile"
    | "notifications";

export default function ManualUsuario() {
    const [section, setSection] = useState<SectionKey>("overview");

    return (
        <>
            <div className="w-full h-[86vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">Manual do Usuário</h2>
                        <p className="text-sm text-gray-500">Guia rápido para as principais funcionalidades</p>
                    </div>
                </div>

                <div className="flex flex-1 min-h-0">
                    <aside className="w-1/6 border-r hidden md:block">
                        <div className="h-full overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            <ManualNavButton label="Visão Geral" keyName="overview" section={section} setSection={setSection} />
                            <ManualNavButton label="Tarefas" keyName="tasks" section={section} setSection={setSection} />
                            <ManualNavButton label="Equipes" keyName="teams" section={section} setSection={setSection} />
                            <ManualNavButton label="Projetos" keyName="projects" section={section} setSection={setSection} />
                            <ManualNavButton label="Kanban" keyName="kanban" section={section} setSection={setSection} />
                            <ManualNavButton label="Listagem" keyName="list" section={section} setSection={setSection} />
                            <ManualNavButton label="Métricas" keyName="metrics" section={section} setSection={setSection} />
                            <ManualNavButton label="Calendário" keyName="calendar" section={section} setSection={setSection} />
                            <ManualNavButton label="Perfil" keyName="profile" section={section} setSection={setSection} />
                            <ManualNavButton label="Notificações" keyName="notifications" section={section} setSection={setSection} />
                        </div>
                    </aside>

                    <main className="flex-1 overflow-y-auto p-6 min-w-0">
                        <div className="space-y-8">
                            {section === "overview" && <SectionWrapper title="Introdução" subtitle="O que é este sistema e como ele organiza equipes, projetos e tarefas.">
                                <p className="text-gray-600 py-6">
                                    Este sistema foi desenvolvido para gerenciar equipes e projetos de forma colaborativa — crie, atribua e acompanhe.
                                </p>
                                <figure className="border rounded-md overflow-hidden bg-gray-50">
                                    <img src="../../../../public/capturas_de_tela/kanban.png" alt="placeholder" className="w-full object-cover" />
                                    <figcaption className="p-2 text-xs text-gray-500">Exemplo de quadro Kanban para visualização de tarefas</figcaption>
                                </figure>
                            </SectionWrapper>}

                            {section === "tasks" && <SectionWrapper title="Tarefas" subtitle="Tudo que você precisa saber sobre tarefas">
                                <p className="text-gray-600 py-6">As tarefas representam ações a serem realizadas. Elas possuem título, descrição, responsável, prioridade e prazo.</p>
                                <ol className="flex flex-col gap-4 pl-6 py-2 list-disc ml-5 mt-3 text-gray-600 space-y-2">
                                    <li><strong>Criar tarefa:</strong> botão “Nova tarefa” → preencher campos → salvar.</li>
                                    <li><strong>Editar tarefa:</strong> clique na tarefa → modal de detalhes → editar e salvar.</li>
                                    <li><strong>Movimentar:</strong> arraste a tarefa para outras colunas para mudar de status.</li>
                                </ol>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <figure className="border rounded-md overflow-hidden bg-gray-50">
                                        <img src="../../../../public/capturas_de_tela/modal-criar-tarefa.png" alt="placeholder" className="w-full object-cover" />
                                        <figcaption className="p-2 text-xs text-gray-500">Interface de criação de tarefas</figcaption>
                                    </figure>
                                    <figure className="border rounded-md overflow-hidden bg-gray-50">
                                        <img src="../../../../public/capturas_de_tela/mover-tarefas.png" alt="placeholder" className="w-full object-cover" />
                                        <figcaption className="p-2 text-xs text-gray-500">Arraste de tarefas</figcaption>
                                    </figure>
                                </div>
                            </SectionWrapper>}

                            {section === "teams" && <SectionWrapper title="Equipes" subtitle="Gerencie membros e permissões">
                                <p className="text-gray-600 py-6">Equipes agrupam pessoas e projetos. Somente membros têm acesso aos projetos vinculados à equipe.</p>
                                <ul className="list-disc flex flex-col gap-4 pl-6 py-2 ml-5 mt-3 text-gray-600 space-y-2">
                                    <li><strong>Criar equipe:</strong> vá em Equipes → Criar Equipe → preencher nome, descrição e email dos membros desejados.</li>
                                    <li><strong>Editar equipe:</strong> clicar no card da equipe, alterar nome, descrição ou iontegrantes e slavar alterações.</li>
                                    <li><strong>Convidar membros:</strong> um convite é enviado assim que o email do integrante é selecionado no modal de criação de equipe.</li>
                                </ul>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <figure className="border rounded-md overflow-hidden bg-gray-50">
                                        <img src="../../../../public/capturas_de_tela/tela-equipes.png" alt="placeholder" className="w-full object-cover" />
                                        <figcaption className="p-2 text-xs text-gray-500">Pagina de equipes</figcaption>
                                    </figure>
                                    <figure className="border rounded-md overflow-hidden bg-gray-50">
                                        <img src="../../../../public/capturas_de_tela/modal-criar-equipe.png" alt="placeholder" className="w-full object-cover" />
                                        <figcaption className="p-2 text-xs text-gray-500">Interface de criação de equipes</figcaption>
                                    </figure>
                                </div>
                            </SectionWrapper>}

                            {section === "projects" && <SectionWrapper title="Projetos" subtitle="Organize tarefas por projeto">
                                <p className="text-gray-600 py-6">Projetos são coleções de tarefas relacionadas a um objetivo. Eles pertencem a uma equipe.</p>
                                <ol className="list-disc flex flex-col gap-4 pl-6 py-2 ml-5 mt-3 text-gray-600 space-y-2">
                                    <li><strong>Criar projeto:</strong> selecione o campo da equipe → Novo Projeto (ADD) → preencher nome e descrição do projeto.</li>
                                    <li><strong>Editar projeto:</strong> alterar nome ou descrição.</li>
                                </ol>
                                <div className="flex md:grid-cols-2 gap-4 mt-4 max-h-sm">
                                    <figure className="border rounded-md overflow-hidden bg-gray-50">
                                        <img src="../../../../public/capturas_de_tela/lista-projetos.png" alt="placeholder" className="w-full object-cover" />
                                        <figcaption className="p-2 text-xs text-gray-500">Menu de projetos</figcaption>
                                    </figure>
                                    <figure className="border rounded-md overflow-hidden bg-gray-50">
                                        <img src="../../../../public/capturas_de_tela/modal-criar-projeto.png" alt="placeholder" className="w-full object-cover" />
                                        <figcaption className="p-2 text-xs text-gray-500">Interface de criação de projetos</figcaption>
                                    </figure>
                                </div>
                            </SectionWrapper>}

                            {section === "kanban" && <SectionWrapper title="Kanban" subtitle="Visão visual das tarefas">
                                <p className="text-gray-600 py-6">O kanban permite mover tarefas entre colunas representando status (A Fazer, Fazendo, Concluído).</p>
                                <ul className="list-disc flex flex-col gap-4 pl-6 py-2 ml-5 mt-3 text-gray-600 space-y-2">
                                    <li>Arraste e solte para mudar a disposição das colunas.</li>
                                    <li>Clique em "+ adicionar tarefa" na coluna para criar tarefa direto na coluna.</li>
                                </ul>
                                <figure className="border rounded-md overflow-hidden bg-gray-50">
                                    <img src="../../../../public/capturas_de_tela/mover-colunas.png" alt="placeholder" className="w-full object-cover" />
                                    <figcaption className="p-2 text-xs text-gray-500">Organização de colunas</figcaption>
                                </figure>
                            </SectionWrapper>}

                            {section === "list" && <SectionWrapper title="Listagem de Tarefas" subtitle="Tabela com filtros e ordenação">
                                <p className="text-gray-600 py-6">Visualize todas as tarefas da equipe em uma lista com filtros por responsável e nome da tarefa.</p>
                                <figure className="border rounded-md overflow-hidden bg-gray-50">
                                    <img src="../../../../public/capturas_de_tela/lista-tarefas.png" alt="placeholder" className="w-full object-cover" />
                                    <figcaption className="p-2 text-xs text-gray-500">Listagem de tarefas</figcaption>
                                </figure>
                            </SectionWrapper>}

                            {section === "metrics" && <SectionWrapper title="Métricas da Equipe" subtitle="Indicadores e gráficos">
                                <p className="text-gray-600 py-6">Acompanhe produtividade, tarefas atrasadas e distribuição de tarefas por membro.</p>
                                <figure className="border rounded-md overflow-hidden bg-gray-50">
                                    <img src="../../../../public/capturas_de_tela/metricas.png" alt="placeholder" className="w-full object-cover" />
                                    <figcaption className="p-2 text-xs text-gray-500">Tela de métricas</figcaption>
                                </figure>
                            </SectionWrapper>}

                            {section === "calendar" && <SectionWrapper title="Calendário" subtitle="Cronograma das tarefas">
                                <p className="text-gray-600 py-6">O calendário mostra prazos e permite visualizar o cronograma por dia, semana ou mês.</p>
                                <ul className="list-disc flex flex-col gap-4 pl-6 py-2 ml-5 mt-3 text-gray-600 space-y-2">
                                    <li>Crie tarefas de um projeto direto no prazo desejado</li>
                                    <li>É possível sincronizar com o Google Calendar para receber prazos no seu calendário pessoal.</li>
                                </ul>
                                <div className="flex md:grid-cols-2 gap-4 mt-4 max-h-sm">
                                    <figure className="border rounded-md overflow-hidden bg-gray-50">
                                        <img src="../../../../public/capturas_de_tela/calendario.png" alt="placeholder" className="w-full object-cover" />
                                        <figcaption className="p-2 text-xs text-gray-500">Calendário</figcaption>
                                    </figure>
                                    <figure className="border rounded-md overflow-hidden bg-gray-50">
                                        <img src="../../../../public/capturas_de_tela/calendario-google.png" alt="placeholder" className="w-full object-cover" />
                                        <figcaption className="p-2 text-xs text-gray-500">Menu de login google calendar</figcaption>
                                    </figure>
                                </div>
                            </SectionWrapper>}

                            {section === "profile" && <SectionWrapper title="Perfil" subtitle="Configurações do usuário">
                                <p className="text-gray-600 py-6">Edite suas informações pessoais, altere foto do usuário e preferências.</p>
                                <div className="flex md:grid-cols-2 gap-4 mt-4 max-h-sm">
                                    <figure className="border rounded-md overflow-hidden bg-gray-50">
                                        <img src="../../../../public/capturas_de_tela/modal-perfil.png" alt="placeholder" className="w-full object-cover" />
                                        <figcaption className="p-2 text-xs text-gray-500">Opcões de perfil</figcaption>
                                    </figure>
                                    <figure className="border rounded-md overflow-hidden bg-gray-50">
                                        <img src="../../../../public/capturas_de_tela/modal-edicao-perfil.png" alt="placeholder" className="w-full object-cover" />
                                        <figcaption className="p-2 text-xs text-gray-500">Menu de edição de perfil</figcaption>
                                    </figure>
                                </div>
                            </SectionWrapper>}

                            {section === "notifications" && <SectionWrapper title="Notificações & Convites" subtitle="Fique por dentro do que importa">
                                <p className="text-gray-600 py-6">Notificações avisam sobre convites, atualizações de tarefas e demais eventos relevantes.</p>
                                <ul className="text-gray-600 mt-2 list-disc flex flex-col gap-4 pl-6 py-2">
                                    <li className="">Ao receber um convite para equipe, aceite ou recuse diretamente pela notificação.</li>
                                </ul>
                                <figure className="border rounded-md overflow-hidden bg-gray-50 max-w-xs">
                                    <img src="../../../../public/capturas_de_tela/notificacoes.png" alt="placeholder" className="w-full object-cover" />
                                    <figcaption className="p-2 text-xs text-gray-500">Menu de notificações</figcaption>
                                </figure>
                            </SectionWrapper>}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

function ManualNavButton({ label, keyName, section, setSection }: { label: string; keyName: SectionKey; section: SectionKey; setSection: (s: SectionKey) => void; }) {
    const active = section === keyName;
    return (
        <button
            onClick={() => setSection(keyName)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${active ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-50 text-gray-700"}`}
        >
            {label}
        </button>
    );
}

function SectionWrapper({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode; }) {
    return (
        <section>
            <h3 className="text-xl font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            <div className="mt-4 text-gray-700">{children}</div>
        </section>
    );
}
