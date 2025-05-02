'use client';
import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ReactMarkdown from 'react-markdown';

type Chat = {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
};

type Message = {
  id: string;
  role: string;
  text: string;
  chatId: string;
  createdAt: Date;
};

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [chats, setChats] = useState<(Chat & { messages: Message[] })[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentChat = chats.find((chat) => chat.id === currentChatId);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  async function fetchChats() {
    const res = await fetch('/api/chats');
    const data = await res.json();
    setChats(data);
    if (data.length > 0) setCurrentChatId(data[0].id);
  }

  async function createNewChat() {
    const res = await fetch('/api/chats/new', { method: 'POST' });
    const newChat = await res.json();
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentChatId) return;
  
    const userMessage: Message = {
      role: 'user',
      text: input,
      id: '',
      chatId: currentChatId,
      createdAt: new Date(),
    };
  
    const newMessages = [...(currentChat?.messages || []), userMessage];
  
    setInput('');
    setLoading(true);
  
    // Show "typing..." placeholder
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [
                ...newMessages,
                {
                  role: 'assistant',
                  text: '...',
                  id: '',
                  chatId: currentChatId,
                  createdAt: new Date(),
                },
              ],
            }
          : chat
      )
    );
  
    try {
      const res = await fetch('/api/convo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: currentChatId, messages: newMessages }),
      });
  
      if (!res.body) throw new Error('No response body');
  
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = '';
  
      const appendChunk = (chunk: string) => {
        aiText += chunk;
  
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: [
                    ...newMessages,
                    {
                      role: 'assistant',
                      text: aiText,
                      id: '',
                      chatId: currentChatId,
                      createdAt: new Date(),
                    },
                  ],
                }
              : chat
          )
        );
      };
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        appendChunk(chunk);
      }
    } catch {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [
                  ...newMessages,
                  {
                    role: 'assistant',
                    text: '❌ Error getting answer.',
                    id: '',
                    chatId: currentChatId,
                    createdAt: new Date(),
                  },
                ],
              }
            : chat
        )
      );
    }
  
    setLoading(false);
  };
  
  
  
  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'}`}>
      {/* Sidebar */}
      <div className={`w-64 h-screen fixed top-0 left-0 overflow-y-auto p-4 ${darkMode?" bg-zinc-800 text-white":" bg-gray-300 text-black"} `}>
        <button onClick={createNewChat} className={`w-full py-2 mb-1 cursor-pointer ${darkMode ? "bg-gray-200 text-black" : "bg-black/80 text-white"} rounded font-semibold`}>
          + New Chat
        </button>
        {chats.map((chat) => {
  const isActive = chat.id === currentChatId;

  return (
    <button
      key={chat.id}
      onClick={() => setCurrentChatId(chat.id)}
      className={`cursor-pointer w-full text-left px-3 py-2 my-1 rounded-lg transition-colors duration-200
        ${
          isActive
            ? 'font-semibold border' // ✅ active chat = no bg
            : darkMode
            ? 'bg-zinc-900 text-zinc-200 hover:bg-zinc-700'
            : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
        }`}
    >
      {chat.title}
    </button>
  );
})}

      </div>

      {/* Main Chat Area */}
      <main className="ml-64 flex-1 px-4 py-6 transition-colors duration-300">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm shadow hover:opacity-80 transition ${
            darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-900'
          }`}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <h1 className="text-3xl font-bold mb-4 text-center">💬 DejnyGPT</h1>

        <div
          ref={scrollRef}
          className={`w-full max-w-3xl h-[60vh] overflow-y-auto p-4 rounded-xl shadow-inner space-y-4 mb-6 mx-auto ${
            darkMode ? 'bg-zinc-800' : 'bg-zinc-100'
          }`}
        >
          {currentChat?.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : darkMode
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-300 text-zinc-900'
                }`}
              >
           <div className="prose max-w-none dark:prose-invert">
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl mx-auto flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className={`flex-1 px-4 py-3 rounded-xl border outline-none ${
              darkMode
                ? 'border-zinc-600 bg-zinc-800 text-white'
                : 'border-zinc-300 bg-white text-zinc-900'
            }`}
          />
          <button
            type="submit"
            disabled={loading || !currentChatId}
            className={` ${ darkMode ? "bg-white text-black hover:bg-white/80":"bg-black text-white hover:bg-black/80"} font-semibold p-3 rounded-xl  disabled:opacity-50 transition flex items-center justify-center`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </main>
    </div>
  );
}
