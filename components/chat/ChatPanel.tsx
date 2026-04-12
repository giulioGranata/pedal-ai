'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, AthleteData, ChartData } from '@/lib/types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChatPanelProps {
  athleteData: AthleteData;
}

// Helper per identificare se un frammento di stringa assomiglia a un JSON del grafico (inizia con {"type":"chart")
function parseChartFromText(text: string): { chart: ChartData | null, textRemaining: string } {
  try {
    const chartStartMatch = text.match(/{\s*"type"\s*:\s*"chart"/);
    if (chartStartMatch && chartStartMatch.index !== undefined) {
      const startIndex = chartStartMatch.index;
      // Trova la fine del json (bilanciamento parentesi spartano, qui assumiamo un JSON non annidato per semplicità o chiusura con })
      const braceMatch = text.slice(startIndex).indexOf('}');
      if (braceMatch !== -1) {
        // Cerca di estrarre fino alla fine della riga o blocco se ci fossero parentesi array interne
        let open = 0;
        let endIndex = -1;
        for (let i = startIndex; i < text.length; i++) {
          if (text[i] === '{') open++;
          if (text[i] === '}') open--;
          if (open === 0) {
            endIndex = i;
            break;
          }
        }
        
        if (endIndex !== -1) {
          const jsonStr = text.slice(startIndex, endIndex + 1);
          const textRemaining = text.slice(0, startIndex) + text.slice(endIndex + 1);
          const chart = JSON.parse(jsonStr) as ChartData;
          return { chart, textRemaining };
        }
      }
    }
  } catch (e) {
    // Ignorare i problemi di parsing parziale
  }
  return { chart: null, textRemaining: text };
}

function RecChart({ chart }: { chart: ChartData }) {
  const ChartComp = chart.chartType === 'bar' ? BarChart : LineChart;
  const DataComp = chart.chartType === 'bar' ? Bar : Line;
  
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 my-4">
      <h3 className="text-sm font-semibold mb-2">{chart.title}</h3>
      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          {/* @ts-ignore */}
          <ChartComp data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} />
             <XAxis dataKey={chart.xKey} tickLine={false} axisLine={false} />
             <YAxis tickLine={false} axisLine={false} />
             <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
             {chart.yKeys.map((key, i) => (
               // @ts-ignore
               <DataComp 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  fill={i === 0 ? '#1D9E75' : '#3b82f6'} 
                  stroke={i === 0 ? '#1D9E75' : '#3b82f6'} 
               />
             ))}
          </ChartComp>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ChatPanel({ athleteData }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll all'ultimo messaggio
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, data: athleteData })
      });

      if (!res.ok || !res.body) throw new Error('Errore di rete');

      // Setup streaming state
      setMessages([...newMessages, { role: 'assistant', content: '' }]);
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        
        setMessages(current => {
          const last = current[current.length - 1];
          return [
             ...current.slice(0, current.length - 1),
             { ...last, content: assistantText }
          ];
        });
      }
    } catch (err) {
       console.error("Errore invio messaggio", err);
       setMessages(prev => [...prev, { role: 'assistant', content: '❌ _Errore di connessione a Claude._ Verifica le chiavi API nel file .env.local' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "Come sono i miei valori di TSB?",
    "Dammi un consiglio sull'allenamento in base al mio HRV",
    "Analizza l'attività di ieri"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] max-w-3xl mx-auto w-full relative">
      <div className="flex-1 overflow-y-auto w-full px-4 pt-4 pb-24 space-y-6">
        
        {messages.length === 0 && (
          <div className="text-center mt-12 mb-8">
             <div className="w-16 h-16 bg-[#1D9E75]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1D9E75] text-2xl">⚡</div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Coach PedalAI</h2>
             <p className="text-gray-500 dark:text-gray-400 mt-2">Pronto ad analizzare i tuoi dati. Chiedimi consigli d'allenamento.</p>
             
             <div className="flex flex-wrap justify-center gap-2 mt-8">
               {suggestions.map(s => (
                 <button 
                  key={s} 
                  onClick={() => { setInput(s); setTimeout(() => handleSubmit(), 50); }}
                  className="bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                 >
                   {s}
                 </button>
               ))}
             </div>
          </div>
        )}

        {messages.map((m, i) => {
          const { chart, textRemaining } = m.role === 'assistant' ? parseChartFromText(m.content) : { chart: null, textRemaining: m.content };
          
          return (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] text-xs shrink-0 mt-1">AI</div>
              )}
              
              <div className={`max-w-[85%] ${m.role === 'user' ? 'bg-[#1D9E75] text-white rounded-2xl rounded-tr-sm px-4 py-3' : 'text-gray-800 dark:text-gray-200'} text-[15px] leading-relaxed`}>
                {m.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap">{textRemaining}</div>
                    {chart && <RecChart chart={chart} />}
                  </>
                )}
              </div>
            </div>
          );
        })}
        {isTyping && (
           <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-[#1D9E75]/10 flex items-center justify-center text-[#1D9E75] text-xs shrink-0">AI</div>
             <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 text-gray-500 text-sm">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
             </div>
           </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="fixed bottom-0 md:bottom-auto left-0 md:left-auto md:absolute bottom-16 md:bottom-4 w-full p-4 bg-background z-20">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto items-end bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-2 px-3 shadow-sm focus-within:border-[#1D9E75] transition-colors">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Chiedi al coach..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-10 max-h-32 text-sm pt-2.5 px-2 dark:text-white"
            rows={1}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-[#1D9E75] text-white flex items-center justify-center rounded-xl font-medium shrink-0 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
