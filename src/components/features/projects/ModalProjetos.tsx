import React from "react";
import { authFetch } from "@/utils/api";
import { toast } from "react-toastify";

type NovoProjeto = {
  projNome: string;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  equipeId: string | null;
  onAddProject?: (projeto: NovoProjeto) => void;
};

type ModalState = {
  projNome: string;
  projDescricao: string;
  team: string;
  erros?: { [campo: string]: string };
};

export default class ModalProjetos extends React.Component<
  ModalProps,
  ModalState
> {
  private modalRef = React.createRef<HTMLDivElement>();
  state: ModalState = {
    projNome: "",
    projDescricao: "",
    team: "Selecione a equipe",
    erros: {},
  };

  componentDidMount() {
    if (this.props.isOpen) {
      document.addEventListener("mousedown", this.handleOutsideClick);
    }
  }

  componentDidUpdate(prevProps: ModalProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      document.addEventListener("mousedown", this.handleOutsideClick);
    } else if (!this.props.isOpen && prevProps.isOpen) {
      document.removeEventListener("mousedown", this.handleOutsideClick);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleOutsideClick);
  }

  private handleOutsideClick = (event: MouseEvent) => {
    if (
      this.modalRef.current &&
      !this.modalRef.current.contains(event.target as Node)
    ) {
      this.props.onClose();
    }
  };

  handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  private resetState = () => {
    this.setState({
      projNome: "",
      projDescricao: "",
      erros: {},
    });
  };

  adicionarProjeto = async () => {
    if (!this.props.equipeId) {
      toast.error("Nenhuma equipe selecionada para adicionar o projeto.");
      return;
    }

    try {
      const response = await authFetch(
        "http://localhost:8080/projeto/cadastrar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({
            projNome: this.state.projNome,
            projDescricao: this.state.projDescricao,
            equipeId: this.props.equipeId,
          }),
        }
      );

      const data = await response.text();
      if (response.ok) {
        toast.success(data);
        window.dispatchEvent(new CustomEvent("projeto:created"));
        this.resetState();
        this.props.onClose();
      } else {
        toast.error(data);
      }
    } catch (error) {
      toast.error("Não foi possível adicionar o projeto.");
      console.error("Erro:", error);
    }
  };

  handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!this.state.projNome.trim()) {
      toast.error("Por favor, insira o nome do projeto.");
      console.log("Por favor, insira o nome do projeto.");
      return;
    } else if (!this.state.projDescricao.trim()) {
      toast.error("Por favor, insira a descrição do projeto.");
      console.log("Por favor, insira a descrição do projeto.");
      return;
    }

    await this.adicionarProjeto();
  };

  render() {
    const { isOpen, onClose } = this.props;

    if (!isOpen) {
      return null;
    }

    return (
      <div className="fixed inset-0 bg-gray-600/60 flex items-center justify-center z-50 p-4 font-sans">
        <div
          ref={this.modalRef}
          className="bg-white rounded-lg shadow-2xl w-full max-w-3xl p-8 flex flex-col gap-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Adicionar Novo Projeto
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl transition-colors duration-200"
            >
              &times;
            </button>
          </div>

          <form onSubmit={this.handleSubmit} className="flex flex-col gap-y-5">
            <div>
              <label
                htmlFor="projNome"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nome do Projeto
              </label>
              <input
                type="text"
                id="projNome"
                name="projNome"
                placeholder="Nome do Projeto"
                value={this.state.projNome}
                onChange={this.handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>

            <div>
              <label
                htmlFor="projDescricao"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descrição
              </label>
              <textarea
                id="projDescricao"
                name="projDescricao"
                rows={3}
                placeholder=""
                value={this.state.projDescricao}
                onChange={this.handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              ></textarea>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Criar projeto
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
