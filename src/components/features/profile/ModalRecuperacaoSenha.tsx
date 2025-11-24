import { useEffect, useRef, useState } from "react";

interface ModalProps {
    onClose: () => void;
}

export default function ModalRecuperacaoSenha({ onClose }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState(""); 
    const [erro, setErro] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleEnviarEmail = async () => {
        if (!email) return;
        
        setLoading(true);
        setMensagem("");
        setErro(false);

        try {
            const response = await fetch("http://localhost:8000/auth/esqueci-senha", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email })
            });

            if (response.ok) {
                setMensagem("Email enviado! Verifique sua caixa de entrada.");
            } else {
                setErro(true);
                setMensagem("Erro ao enviar. Verifique se o email está correto.");
            }
        } catch (error) {
            setErro(true);
            setMensagem("Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600/60 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl text-right p-4">
                    &times;
                </button>
                <div className="flex flex-col items-center">
                    <img src="https://uxwing.com/wp-content/themes/uxwing/download/communication-chat-call/mail-send-icon.png" className="w-32 md:w-40" alt="Email Icon"></img>
                    <p className="text-xl md:text-2xl">Esqueceu sua senha?</p>
                    
                    {/* Feedback visual de erro ou sucesso */}
                    {mensagem && (
                        <p className={`mt-2 px-4 text-center ${erro ? "text-red-500" : "text-green-600"}`}>
                            {mensagem}
                        </p>
                    )}

                    <div className="flex flex-col gap-5 pt-8 pb-8 w-full max-w-xs px-4 md:px-0">
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="email"
                                placeholder="E-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white pl-10 pr-3 py-2 border border-gray-300 outline-none rounded-sm"
                            />
                        </div>
                        <button 
                            onClick={handleEnviarEmail}
                            disabled={loading}
                            className={`w-full text-white rounded-sm outline-none cursor-pointer p-2 m-2 ${loading ? 'bg-gray-400' : 'bg-indigo-950'}`}
                        >
                            {loading ? "Enviando..." : "Enviar e-mail"}
                        </button>
                    </div>
                </div>
            </div>    
        </div>
    );
}