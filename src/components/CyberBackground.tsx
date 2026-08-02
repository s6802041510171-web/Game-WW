import React from 'react';

export const CyberBackground: React.FC<{ isCriticalHp?: boolean; isBreachedAlert?: boolean }> = ({
  isCriticalHp = false,
  isBreachedAlert = false
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Deepest Obsidian Base Background */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isBreachedAlert
          ? 'bg-red-950/50'
          : isCriticalHp
          ? 'bg-red-950/30'
          : 'bg-[#050505]'
      }`} />

      {/* Cyber Technical Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#ef4444_1px,transparent_1px),linear-gradient(to_bottom,#ef4444_1px,transparent_1px)] bg-[size:32px_32px]"
      />

      {/* Radial Crimson Glow Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[radial-gradient(circle_at_50%_0%,rgba(180,20,20,0.15)_0%,transparent_75%)]" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse" />

      {/* Sophisticated Dark CRT Scanline Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-50"
        style={{ backgroundSize: '100% 3px, 3px 100%' }}
      />

      {/* Flashing Breach Border */}
      {(isCriticalHp || isBreachedAlert) && (
        <div className="absolute inset-0 border-2 border-red-600/60 animate-pulse shadow-[inset_0_0_50px_rgba(239,68,68,0.2)]" />
      )}
    </div>
  );
};
