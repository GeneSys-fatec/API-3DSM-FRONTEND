import React from "react";
import ListaTarefas from "../components/features/tasks/ListaTarefas";
import type { Projeto } from "@/types/types";
type HomeState = {
  projetos: Projeto[];
  isModalOpen: boolean;
};

export default class Tarefas extends React.Component<object, HomeState> {
  render() {
    return (
      <>
        <div className="flex justify-center pt-5 min-w-full">
          <ListaTarefas></ListaTarefas>
        </div>
      </>
    );
  }
}
