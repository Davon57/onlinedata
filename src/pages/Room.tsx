import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ChevronLeft, Send, Copy, Check, Clock, Users, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  roomId: string;
  content: string;
  timestamp: number;
}

export default function Room() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomUserCount, setRoomUserCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to the same origin, which will be proxied by Vite in dev and served by Express in prod
    const newSocket = io({
      path: '/socket.io/'
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join_room', id);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('history', (history: Message[]) => {
      setMessages(history);
      scrollToBottom();
    });

    newSocket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on('room_user_count', (count: number) => {
      setRoomUserCount(count);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    
    socket.emit('new_message', {
      roomId: id,
      content: input
    });
    
    setInput('');
  };

  const handleClearRoom = () => {
    if (!socket || !id) return;
    const confirmed = window.confirm('确认清空当前房间的同步记录吗？');
    if (!confirmed) return;
    socket.emit('clear_room', id);
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
      .format(d)
      .replace(/\//g, '-');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-[#1C1C1E] flex flex-col md:flex-row">
      {/* Sidebar / Top area for input */}
      <div className="w-full md:w-[400px] lg:w-[480px] bg-white dark:bg-[#2C2C2E] border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1C1C1E] text-gray-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">房间: {id}</span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {roomUserCount} 人在线
                </span>
                <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {connected ? '已连接' : '未连接'}
                </span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClearRoom}
            disabled={!connected}
            className="h-9 px-3 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-[13px] font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空记录
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴接口参数、JSON或长文本..."
            className="flex-1 w-full resize-none rounded-2xl bg-gray-50 dark:bg-[#1C1C1E] border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-[#2C2C2E] focus:ring-2 focus:ring-blue-500/20 p-4 text-[15px] leading-relaxed text-gray-900 dark:text-white transition-all font-mono placeholder:font-sans placeholder:text-gray-400"
          />
          <div className="mt-4 shrink-0 flex justify-end">
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-medium flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>发送同步</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main area for history */}
      <div className="flex-1 h-[calc(100vh-320px)] md:h-screen overflow-y-auto p-4 md:p-8 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-[#2C2C2E] flex items-center justify-center">
              <Clock className="w-6 h-6 opacity-50" />
            </div>
            <p className="text-sm">暂无同步记录，在左侧输入并发送吧</p>
          </div>
        ) : (
          [...messages]
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((msg) => (
            <div 
              key={msg.id}
              className="group bg-white dark:bg-[#2C2C2E] rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_2px_10px_rgb(0,0,0,0.1)] transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-mono text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(msg.timestamp)}
                </span>
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className={`h-8 px-3 rounded-lg text-[13px] font-medium flex items-center gap-1.5 transition-colors ${
                    copiedId === msg.id 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-gray-50 hover:bg-gray-100 dark:bg-[#1C1C1E] dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 md:opacity-0 md:group-hover:opacity-100'
                  }`}
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      复制参数
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[14px] leading-relaxed text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-all bg-gray-50 dark:bg-[#1C1C1E] p-4 rounded-xl">
                {msg.content}
              </pre>
            </div>
          ))
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
}
