import { createContext, useState, useContext, type ReactNode } from "react";

export type ModalContextType = {
    isModalOpen: boolean;
    modalContent: ReactNode | null;
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({children}: {children: ReactNode}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState <ReactNode | null>(null);

    const openModal = (content: ReactNode) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    }

    const value = {isModalOpen, modalContent, openModal, closeModal};

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
}

export const useModal = () => {
    const context = useContext(ModalContext);

    if (context === undefined) {
        throw new Error('useModal deve ser usado dentro de um ModalProvider');
    }

    return context;
}