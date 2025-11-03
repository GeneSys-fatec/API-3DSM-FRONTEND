import React from 'react';
import { useModal } from '../context/ModalContext';

export default function ModalRenderer() {
    const { isModalOpen, modalContent } = useModal();

    if (!isModalOpen || !modalContent) {
        return null;
    }

    return <>{modalContent}</>;
}
