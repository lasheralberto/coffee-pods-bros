import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, Minus, X, Send, ThumbsUp, Copy } from 'lucide-react';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: Date;
}

interface ChatFloatingContactUsProps {
  /** Controlled open state — provided by the navbar "Contactar" button */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const BOT_INITIAL: Message = {
  id: 'init',
  role: 'assistant',
  text: 'Hey! Soy tu asistente de GLOPET. Pregúntame sobre nuestro café, precios o funcionalidades.',
  timestamp: new Date(),
};

export const ChatFloatingContactUs: React.FC<ChatFloatingContactUsProps> = ({
  open: controlledOpen,
  onOpenChange,
}) => {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([BOT_INITIAL]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setMinimized(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setLoading(true);

    // Simulación de respuesta automática
    // En producción, reemplaza este timeout por una llamada al LLM o servicio de soporte
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const botReplies: string[] = [
      'Gracias por tu mensaje. Nuestro equipo te responderá en breve.',
      '¡Buena pregunta! Puedes explorar nuestro catálogo en la sección Tienda.',
      'Ofrecemos envíos 48 h a toda España. ¿Tienes alguna otra pregunta?',
      'Puedes cancelar tu suscripción en cualquier momento desde tu perfil.',
    ];
    const replyText = botReplies[Math.floor(Math.random() * botReplies.length)];

    const botMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: replyText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleCopy = (msg: Message) => {
    void navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* ── Botón flotante — solo en modo no controlado ── */}
      <AnimatePresence>
        {!isControlled && !open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={() => { setOpen(true); setMinimized(false); }}
            aria-label="Abrir chat de contacto"
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-[#1a3a5c] text-white shadow-[0_4px_24px_rgba(26,58,92,0.45)] flex items-center justify-center hover:bg-[#22527a] transition-colors"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Widget de chat ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-widget"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={minimized ? { opacity: 1, scale: 1, y: 0, height: 56 } : { opacity: 1, scale: 1, y: 0, height: 480 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            style={{ originX: 1, originY: 1 }}
            className="fixed bottom-6 right-6 z-[9999] w-[340px] rounded-2xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.18)] border border-[#e8ddd0] bg-white flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a3a5c] text-white flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">AI Assistant</p>
                <p className="text-xs text-white/70 leading-tight">Always here to help</p>
              </div>
              <button
                onClick={() => setMinimized((v) => !v)}
                aria-label={minimized ? 'Expandir chat' : 'Minimizar chat'}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => { setOpen(false); setMinimized(false); }}
                aria-label="Cerrar chat"
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body — solo visible cuando no está minimizado */}
            {!minimized && (
              <>
                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#faf6ef]">
                  {messages.map((msg) =>
                    msg.role === 'assistant' ? (
                      <div key={msg.id} className="flex flex-col gap-1">
                        <div className="max-w-[82%] bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm border border-[#e8ddd0]">
                          <p className="text-[13px] leading-relaxed text-[#1c1410]">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-2 pl-1">
                          <span className="text-[10px] text-[#7a6a5a]">{formatTime(msg.timestamp)}</span>
                          <button
                            onClick={() => handleCopy(msg)}
                            aria-label="Copiar mensaje"
                            className="text-[#7a6a5a] hover:text-[#1a3a5c] transition-colors"
                          >
                            {copiedId === msg.id ? <ThumbsUp size={11} /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div key={msg.id} className="flex flex-col items-end gap-1">
                        <div className="max-w-[82%] bg-[#1a3a5c] text-white rounded-2xl rounded-tr-sm px-3 py-2">
                          <p className="text-[13px] leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-[#7a6a5a] pr-1">{formatTime(msg.timestamp)}</span>
                      </div>
                    )
                  )}

                  {loading && (
                    <div className="flex gap-1 px-3 py-2 bg-white rounded-2xl rounded-tl-sm w-fit shadow-sm border border-[#e8ddd0]">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#1a3a5c]/50"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.7, delay }}
                        />
                      ))}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Disclaimer */}
                <div className="px-4 py-1.5 bg-[#faf6ef] border-t border-[#e8ddd0] flex-shrink-0">
                  <p className="text-[10px] text-center text-[#c4763a]">
                    Powered by AI — responses may not always be accurate
                  </p>
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 px-3 py-3 border-t border-[#e8ddd0] bg-white flex-shrink-0">
                  <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 text-[13px] bg-transparent outline-none text-[#1c1410] placeholder-[#b0a090]"
                    disabled={loading}
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={!draft.trim() || loading}
                    aria-label="Enviar mensaje"
                    className="w-8 h-8 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#22527a] transition-colors flex-shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
