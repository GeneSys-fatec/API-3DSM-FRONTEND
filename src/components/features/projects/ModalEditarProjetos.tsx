import React from 'react';
import { createPortal } from 'react-dom';
import type { Projeto } from "@/types/types";
import { authFetch } from '@/utils/api';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projeto: Projeto;
  onSaved?: (projeto: Projeto) => void;
};

type ModalState = {
  projNome: string;
  projDescricao: string;
  projDataCriacao: string;
  projDataAtualizacao: string;
  saving: boolean;
  error?: string | null;
};

export default class ModalEditarProjetos extends React.Component<ModalProps, ModalState> {
  private modalRef = React.createRef<HTMLDivElement>();

  constructor(props: ModalProps) {
    super(props);
    this.state = {
      projNome: props.projeto?.projNome || '',
      projDescricao: props.projeto?.projDescricao || '',
      projDataCriacao: props.projeto?.projDataCriacao || '',
      projDataAtualizacao: new Date().toISOString().slice(0, 10),
      saving: false,
      error: null,
    };
  }

  componentDidMount() {
    if (this.props.isOpen) {
      document.addEventListener('mousedown', this.handleOutsideClick);
    }
  }

  componentDidUpdate(prevProps: ModalProps) {
    if (this.props.isOpen && !prevProps.isOpen) {
      document.addEventListener('mousedown', this.handleOutsideClick);
      const { projeto } = this.props;
      this.setState({
        projNome: projeto?.projNome || '',
        projDescricao: projeto?.projDescricao || '',
        projDataCriacao: projeto?.projDataCriacao || '',
        projDataAtualizacao: new Date().toISOString().slice(0, 10),
        error: null,
      });
    } else if (!this.props.isOpen && prevProps.isOpen) {
      document.removeEventListener('mousedown', this.handleOutsideClick);
    }

    if (this.props.projeto?.projId !== prevProps.projeto?.projId && this.props.isOpen) {
      const { projeto } = this.props;
      this.setState({
        projNome: projeto?.projNome || '',
        projDescricao: projeto?.projDescricao || '',
        projDataCriacao: projeto?.projDataCriacao || '',
        projDataAtualizacao: new Date().toISOString().slice(0, 10),
        error: null,
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  private handleOutsideClick = (event: MouseEvent) => {
    if (this.modalRef.current && !this.modalRef.current.contains(event.target as Node)) {
      this.props.onClose();
    }
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    this.setState({ [name]: value } as unknown as Pick<ModalState, keyof ModalState>);
  };


  atualizarProjeto = () => {
    const { projeto } = this.props;
    const { projNome, projDescricao, projDataCriacao, projDataAtualizacao } = this.state;

    this.setState({ saving: true, error: null });

    authFetch(`http://localhost:8080/projeto/atualizar/${projeto.projId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projNome: projNome,
        projDescricao: projDescricao,
        projDataCriacao: projDataCriacao || null,
        projDataAtualizacao: projDataAtualizacao || new Date().toISOString().slice(0, 10),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Erro ao atualizar projeto: ${response.statusText}. Resposta do servidor: ${errorBody}`);
        }
        this.props.onSaved?.({
          projId: projeto.projId,
          projNome: projNome,
          projDescricao: projDescricao,
          projDataCriacao,
        });
        this.props.onClose();
      })
      .catch((error) => {
        console.error("Falha ao atualizar projeto:", error);
        this.setState({ error: "Não foi possível salvar as alterações." });
        console.log("Não foi possível salvar as alterações.");
      })
      .finally(() => this.setState({ saving: false }));
  };

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!this.state.projNome.trim()) {
      console.log('Por favor, insira o nome do projeto.');
      return;
    }

    this.atualizarProjeto();
  };

  render() {
    const { isOpen, onClose } = this.props;

    if (!isOpen) {
      return null;
    }

    const modalContent = (
      <div className="fixed inset-0 bg-gray-600/60 flex items-center justify-center z-50 p-4 font-sans">
        <div ref={this.modalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-3xl p-8 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Editar Projeto</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl transition-colors duration-200">
              &times;
            </button>
          </div>

          <form onSubmit={this.handleSubmit} className='flex flex-col gap-y-5'>
            <div>
              <label htmlFor="projNome" className="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto</label>
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
              <label htmlFor="projDescricao" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
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
            <div className="flex justify-center mt-6 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                disabled={this.state.saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-60"
                disabled={this.state.saving}
              >
                {this.state.saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }
}

