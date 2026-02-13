'use client';

import React, { useState } from 'react';
import { useMultiplayerStore } from '@/store/multiplayerStore';
import { Users, Play, Copy, Check, Grid3X3, Zap, Skull } from 'lucide-react';

const LEVELS = [
  { id: 'easy', name: 'Easy', cols: 4, rows: 2, pairs: 4, icon: Grid3X3, color: 'from-green-500/20 to-emerald-600/20 border-green-500/50', textColor: 'text-green-400' },
  { id: 'medium', name: 'Medium', cols: 6, rows: 6, pairs: 18, icon: Zap, color: 'from-amber-500/20 to-orange-600/20 border-amber-500/50', textColor: 'text-amber-400' },
  { id: 'hard', name: 'Hard', cols: 10, rows: 8, pairs: 40, icon: Skull, color: 'from-red-500/20 to-rose-600/20 border-red-500/50', textColor: 'text-red-400' },
];

export default function RoomLobby() {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const {
    roomId,
    connectionStatus,
    level,
    setLevel,
    createNewRoom,
    joinExistingRoom,
    connect,
  } = useMultiplayerStore();

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError('');

    // Connect first
    if (connectionStatus !== 'connected') {
      connect();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const success = await createNewRoom(level);
    
    if (!success) {
      setError('Failed to create room');
    }
    setIsCreating(false);
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsJoining(true);
    setError('');

    // Connect first
    if (connectionStatus !== 'connected') {
      connect();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const result = await joinExistingRoom(joinRoomId.toUpperCase().trim());
    
    if (!result.success) {
      setError(result.error || 'Failed to join room');
    }
    setIsJoining(false);
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show waiting screen if room created but waiting for opponent
  if (roomId && !useMultiplayerStore.getState().isGameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/50">
            <Users className="w-12 h-12 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Waiting for Opponent</h2>
          <p className="text-slate-400">Share the room code below</p>
        </div>

        {/* Room Code Display */}
        <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700">
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Room Code</div>
            <div className="text-5xl font-black text-cyan-400 tracking-widest mb-4">{roomId}</div>
            <button
              onClick={copyRoomId}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-slate-700/80 text-white hover:bg-slate-600/80 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            useMultiplayerStore.getState().leaveGame();
            useMultiplayerStore.getState().resetGame();
          }}
          className="mt-8 text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-3xl font-bold text-white mb-8">Multiplayer</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4">
        {/* Create Room */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="text-center mb-4">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center border border-green-500/50">
              <Play className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Create Room</h3>
            <p className="text-sm text-slate-400">Start a new game and invite a friend</p>
          </div>

          {/* Level Selection */}
          <div className="mb-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2 text-center">Select Level</div>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((lvl) => {
                const Icon = lvl.icon;
                const isSelected = level === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setLevel(lvl.id)}
                    disabled={isCreating}
                    className={`
                      p-2 rounded-lg border-2 transition-all text-center
                      ${isSelected 
                        ? `${lvl.color} ${lvl.textColor} border-opacity-100` 
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'
                      }
                      ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-bold">{lvl.name}</div>
                    <div className="text-[10px] opacity-70">{lvl.cols}×{lvl.rows}</div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <button
            onClick={handleCreateRoom}
            disabled={isCreating}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400 transition-all disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        {/* Join Room */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="text-center mb-4">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center border border-blue-500/50">
              <Users className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Join Room</h3>
            <p className="text-sm text-slate-400">Enter a room code to join</p>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              maxLength={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-600 text-white text-center text-2xl font-bold tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            
            <button
              onClick={handleJoinRoom}
              disabled={isJoining || !joinRoomId.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-400 hover:to-indigo-400 transition-all disabled:opacity-50"
            >
              {isJoining ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
