import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronDown,
  Loader2,
  Check,
  Copy,
  Zap,
  Radio,
  Settings2
} from 'lucide-react';

export const DEFAULT_N8N_WEBHOOK_URL =
  'https://usharaniboddpalli.app.n8n.cloud/webhook/1facc12f-be81-4a02-b274-fde118b03f71/chat';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface ChatboardProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  variant?: 'floating' | 'embedded';
  className?: string;
}

export const Chatboard: React.FC<ChatboardProps> = ({
  isOpen = true,
  onToggle,
  onClose,
  variant = 'floating',
  className
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ridewise_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall through to initial greeting
      }
    }
    return [
      {
        id: 'welcome-msg',
        sender: 'agent',
        text: `Hello! I am your RideWise AI Chatbot.\n\nI can help you compare ride options across **Rapido, Uber, Ola, Namma Yatri, and BluSmart EV** to find the best option for your journey.\n\nWhere would you like to travel from and to today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('ridewise_n8n_url') || DEFAULT_N8N_WEBHOOK_URL;
  });
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [sessionId] = useState<string>(() => {
    let s = localStorage.getItem('ridewise_chat_session_id');
    if (!s) {
      s = `session-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('ridewise_chat_session_id', s);
    }
    return s;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync chat history to local storage
  useEffect(() => {
    localStorage.setItem('ridewise_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on message change or open
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleClearHistory = () => {
    const initialGreeting: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'agent',
      text: `Chat cleared. How can I assist you with your Indian transit routes today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialGreeting]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // 1. Try server proxy endpoint first (avoids browser CORS)
      let agentReply = '';
      try {
        const proxyRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            sessionId,
            webhookUrl
          })
        });

        if (proxyRes.ok) {
          const data = await proxyRes.json();
          agentReply = data.output || data.text || data.message || '';
        } else {
          const errData = await proxyRes.json().catch(() => ({}));
          console.warn('Proxy route returned non-200, trying direct webhook:', errData);
        }
      } catch (proxyErr) {
        console.warn('Proxy fetch failed, attempting direct fetch:', proxyErr);
      }

      // 2. Direct fallback to n8n webhook if proxy didn't return reply
      if (!agentReply) {
        const directRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*'
          },
          body: JSON.stringify({
            chatInput: text,
            action: 'sendMessage',
            sessionId
          })
        });

        if (!directRes.ok) {
          throw new Error(`Webhook returned status ${directRes.status}`);
        }

        const data = await directRes.json();
        agentReply = data.output || data.text || data.message || JSON.stringify(data);
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: agentReply || 'Received response with empty output.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      console.error('Chat webhook error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        text: `⚠️ Unable to reach the n8n agent workflow (${err.message || 'Network error'}). Please verify the webhook URL and workflow status in n8n Cloud.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    'Cheapest ride from Indiranagar to Airport',
    'Compare Uber vs Ola vs Rapido for 5km',
    'Find 100% electric cabs without surge',
    'What is Namma Yatri 0% commission rate?'
  ];

  // Helper to render basic markdown formatting (bold, newlines, bullet points)
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Bold match replace
      const formattedParts: (string | React.ReactNode)[] = [];
      const parts = line.split(/(\*\*.*?\*\*)/g);

      parts.forEach((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          formattedParts.push(
            <strong key={pIdx} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        } else {
          formattedParts.push(part);
        }
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-2 my-0.5">
            <span className="text-blue-500 font-bold">•</span>
            <span>{formattedParts}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="leading-relaxed">
          {formattedParts}
        </p>
      );
    });
  };

  const renderChatInterface = () => (
    <div
      className={`flex flex-col bg-white border border-slate-200/90 rounded-2xl overflow-hidden ${
        variant === 'embedded'
          ? (className || 'w-full h-[600px] shadow-md')
          : `fixed z-50 transition-all duration-300 ease-out shadow-2xl ${
              isExpanded
                ? 'inset-4 sm:inset-10'
                : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[420px] h-[580px] max-h-[90vh]'
            }`
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-400">
            <Bot className="w-5 h-5" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white tracking-tight">
                RideWise AI Chatbot
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                n8n Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              Rapido ⚡ Uber ⚡ Ola ⚡ Namma Yatri ⚡ BluSmart
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 text-slate-300">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            title="Webhook Configuration"
            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
              showConfig ? 'bg-white/20 text-white' : ''
            }`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClearHistory}
            title="Clear Chat History"
            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {variant === 'floating' && (
            <>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Close Chat"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Webhook Config Panel (Collapsible) */}
      {showConfig && (
        <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Active n8n Webhook URL:
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => {
                setWebhookUrl(e.target.value);
                localStorage.setItem('ridewise_n8n_url', e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-300 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Session ID: <code className="text-slate-300">{sessionId}</code></span>
            <button
              type="button"
              onClick={() => {
                setWebhookUrl(DEFAULT_N8N_WEBHOOK_URL);
                localStorage.setItem('ridewise_n8n_url', DEFAULT_N8N_WEBHOOK_URL);
              }}
              className="text-blue-400 hover:underline cursor-pointer"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'agent' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : msg.isError
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-xs'
                  : 'bg-white text-slate-700 border border-slate-200/90 rounded-tl-xs shadow-sm'
              }`}
            >
              <div className="space-y-1">{renderFormattedText(msg.text)}</div>
              <div
                className={`mt-1 text-[9px] text-right font-medium ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[11px] font-medium text-slate-500 ml-1">
                Chatbot is contacting n8n agent...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Ask:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition-colors border border-slate-200/80 cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box Footer */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask chatbot about rides, fares, ETAs, or EV options..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition disabled:opacity-50 font-medium shadow-2xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl font-bold transition-all shadow-sm ${
              input.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Connected to n8n Webhook: <strong>usharaniboddpalli.app.n8n.cloud</strong></span>
          <a
            href={webhookUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
          >
            <span>Webhook API</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );

  if (variant === 'embedded') {
    return renderChatInterface();
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {!isOpen && (
          <button
            type="button"
            onClick={onToggle}
            className="group relative flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-blue-400/30 cursor-pointer"
            aria-label="Open AI Chatbot"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-blue-600 animate-pulse" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              AI Chatbot
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
              n8n
            </span>
          </button>
        )}
      </div>

      {/* Floating Window */}
      {isOpen && renderChatInterface()}
    </>
  );
};
