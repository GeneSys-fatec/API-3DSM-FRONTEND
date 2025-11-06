import { useEffect, useRef } from "react";

interface ModalProps {
    onClose: () => void;
}

export default function ModalRecuperacaoSenha({ onClose }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose()
        }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [onClose])

    return (
        <div className="fixed inset-0 bg-gray-600/60 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl text-right p-4">
                    &times;
                </button>
                <div className="flex flex-col items-center">
                    <img src="https://uxwing.com/wp-content/themes/uxwing/download/communication-chat-call/mail-send-icon.png" className="w-32 md:w-40"></img>
                    <p className="text-xl md:text-2xl">Esqueceu sua senha?</p>
                    <div className="flex flex-col gap-5 pt-8 pb-8 w-full max-w-xs px-4 md:px-0">
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type=""
                                placeholder="E-mail"
                                name=""
                                className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm"
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-950 text-white rounded-sm outline-none cursor-pointer p-2 m-2">
                            Enviar e-mail
                        </button>
                    </div>
                </div>
            </div>    
        </div>
    )
}