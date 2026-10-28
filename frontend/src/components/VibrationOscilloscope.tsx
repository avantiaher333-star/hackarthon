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
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.moveTo(0, midY - 18);
      ctx.lineTo(w, midY - 18);
      ctx.moveTo(0, midY + 18);
      ctx.lineTo(w, midY + 18);
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
      gradient.addColorStop(0, '#2563EB');
      gradient.addColorStop(0.7, magnitude > 22 ? '#EF4444' : magnitude > 16 ? '#F59E0B' : '#0284C7');
      gradient.addColorStop(1, '#3B82F6');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = magnitude > 20 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(37, 99, 235, 0.3)';
      ctx.shadowBlur = 6;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [magnitude, isMonitoring]);

  return (
    <div className="relative w-full h-16 rounded-xl overflow-hidden bg-blue-50/60 border border-blue-100 p-1 flex items-center">
      <canvas
        ref={canvasRef}
        width={360}
        height={64}
        className="w-full h-full block"
      />
      <div className="absolute right-3 top-2 flex items-center gap-2 pointer-events-none">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
          Peak Jolt
        </span>
        <span className="text-xs font-mono font-bold text-blue-700 bg-white/90 px-2 py-0.5 rounded border border-blue-200 shadow-xs">
          {peakJolt.toFixed(1)} m/s²
        </span>
      </div>
      <div className="absolute left-3 bottom-1.5 flex items-center gap-1.5 pointer-events-none">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isMonitoring ? 'bg-blue-600 animate-ping' : 'bg-slate-400'
          }`}
        />
        <span className="text-[10px] font-mono text-slate-600 font-medium">
          {isMonitoring ? '50Hz Live Accelerometer' : 'Oscilloscope Inactive'}
        </span>
      </div>
    </div>
  );
};
