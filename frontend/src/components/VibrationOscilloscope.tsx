import React, { useEffect, useRef } from 'react';

interface VibrationOscilloscopeProps {
  magnitude: number;
  isMonitoring: boolean;
  peakJolt: number;
}

export const VibrationOscilloscope: React.FC<VibrationOscilloscopeProps> = ({
  magnitude,
  isMonitoring,
  peakJolt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<number[]>(new Array(50).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Add new sample
      const currentVal = isMonitoring ? magnitude : 0;
      historyRef.current.push(currentVal);
      if (historyRef.current.length > 50) {
        historyRef.current.shift();
      }

      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.moveTo(0, midY - 20);
      ctx.lineTo(w, midY - 20);
      ctx.moveTo(0, midY + 20);
      ctx.lineTo(w, midY + 20);
      ctx.stroke();

      // Plot waveform
      const step = w / (historyRef.current.length - 1);
      ctx.beginPath();

      historyRef.current.forEach((val, i) => {
        // Normalize: 0 to 30 m/s^2 maps to amplitude
        const normalized = Math.min(val / 30, 1);
        const amp = normalized * (h * 0.42);
        // Alternate sine vibration effect for visual realism
        const oscillation = Math.sin(Date.now() / 80 + i) * (val > 0.5 ? 2.5 : 0);
        const y = midY - amp + oscillation;

        if (i === 0) {
          ctx.moveTo(0, y);
        } else {
          ctx.lineTo(i * step, y);
        }
      });

      // Waveform gradient color based on severity
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, '#10B981');
      gradient.addColorStop(0.7, magnitude > 22 ? '#F43F5E' : magnitude > 16 ? '#F59E0B' : '#05F292');
      gradient.addColorStop(1, '#06B6D4');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = magnitude > 20 ? 'rgba(244, 63, 94, 0.6)' : 'rgba(16, 185, 129, 0.4)';
      ctx.shadowBlur = 8;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [magnitude, isMonitoring]);

  return (
    <div className="relative w-full h-16 rounded-xl overflow-hidden bg-navy-950/80 border border-white/5 p-1 flex items-center">
      <canvas
        ref={canvasRef}
        width={360}
        height={64}
        className="w-full h-full block"
      />
      <div className="absolute top-1.5 right-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-navy-900/80 px-2 py-0.5 rounded-md border border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>SEISMIC WAVE</span>
      </div>
    </div>
  );
};
