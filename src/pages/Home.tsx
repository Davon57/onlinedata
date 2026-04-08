import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  const generateRoom = () => {
    const id = Math.random().toString(36).substring(2, 6).toUpperCase();
    navigate(`/room/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-[#1C1C1E] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#2C2C2E] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-8 space-y-8">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">在线参数同步</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            极简、实时、精准。跨设备粘贴数据，秒级可见。
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="输入房间口令"
              className="w-full h-14 pl-5 pr-14 rounded-2xl bg-gray-50 dark:bg-[#1C1C1E] border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-[#2C2C2E] focus:ring-2 focus:ring-blue-500/20 text-lg font-medium text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
              maxLength={10}
            />
            <button
              type="submit"
              disabled={!roomId.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-[#2C2C2E] text-gray-400">或者</span>
          </div>
        </div>

        <button
          onClick={generateRoom}
          className="w-full h-14 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-[#1C1C1E] dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium transition-colors"
        >
          快速创建新房间
        </button>

      </div>
    </div>
  );
}