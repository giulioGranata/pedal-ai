'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, AthleteData } from '@/lib/types';

interface ChatPanelProps {
  athleteData: AthleteData;
}

export default function ChatPanel({ athleteData }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasReceivedChunk, setHasReceivedChunk] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, hasReceivedChunk]);

  const stopGeneration = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsTyping(false);
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    setHasReceivedChunk(false);
    setStreamError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, data: athleteData }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error('Errore di rete');

      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        setHasReceivedChunk(true);
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;

        setMessages((current) => {
          const last = current[current.length - 1];
          return [...current.slice(0, current.length - 1), { ...last, content: assistantText }];
        });
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStreamError('Generazione interrotta.');
      } else {
        setStreamError('Errore di connessione a Claude. Verifica la configurazione.');
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Errore di connessione a Claude. Verifica chiavi API ed auth.' },
        ]);
      }
    } finally {
      abortRef.current = null;
      setIsTyping(false);
      setHasReceivedChunk(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] max-w-3xl mx-auto w-full relative">
      <div className="flex-1 overflow-y-auto w-full px-4 pt-4 pb-24 space-y-6">
        {messages.length === 0 && (
          <div className="text-center mt-12 mb-8">
            <div className="w-16 h-16 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1D9E75] text-2xl">
              ⚡
            </div>
            <h2 className="text-xl font-bold text-gray-100">Coach PedalAI</h2>
            <p className="text-gray-400 mt-2">Pronto ad analizzare i tuoi dati. Inizia con una domanda libera.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] text-xs shrink-0 mt-1">
                AI
              </div>
            )}
            <div
              className={`max-w-[85%] ${
                m.role === 'user'
                  ? 'bg-[#1D9E75] text-white rounded-2xl rounded-tr-sm px-4 py-3'
                  : 'text-gray-200'
              } text-[15px] leading-relaxed`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.role === 'assistant' && m.content && (
                <button
                  onClick={() => copyMessage(m.content)}
                  className="mt-2 text-xs text-gray-400 hover:text-gray-200"
                  type="button"
                >
                  Copia risposta
                </button>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] text-xs shrink-0">
              AI
            </div>
            <div className="flex items-center gap-1 bg-gray-900 rounded-2xl px-4 py-3 text-gray-400 text-sm">
              {hasReceivedChunk ? (
                <>
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                    ●
                  </span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>
                    ●
                  </span>
                </>
              ) : (
                <span>Sto pensando...</span>
              )}
            </div>
          </div>
        )}

        {streamError && <p className="text-xs text-amber-400">{streamError}</p>}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-0 md:bottom-auto left-0 md:left-auto md:absolute bottom-16 md:bottom-4 w-full p-4 bg-background z-20">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 max-w-3xl mx-auto items-end bg-gray-900 border border-gray-800 rounded-2xl p-2 px-3 shadow-sm focus-within:border-[#1D9E75] transition-colors"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Chiedi al coach..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-10 max-h-32 text-sm pt-2.5 px-2 text-white"
            rows={1}
          />
          {isTyping ? (
            <button
              type="button"
              onClick={stopGeneration}
              className="h-10 px-3 bg-amber-500 text-black text-xs font-semibold rounded-xl"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 bg-[#1D9E75] text-white flex items-center justify-center rounded-xl font-medium shrink-0 disabled:opacity-50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
