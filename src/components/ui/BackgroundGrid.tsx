import React from "react";

export function BackgroundGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25" />
      
      {/* Radial fade mask */}
      <div className="absolute inset-0 bg-[#09090b] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_70%,#09090b_100%)]" />

      {/* Top glowing ambient gradient blobs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-indigo-500/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 -right-40 w-[400px] h-[400px] bg-cyan-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-2/3 -left-40 w-[400px] h-[400px] bg-violet-600/10 blur-[140px] rounded-full pointer-events-none" />
    </div>
  );
}
