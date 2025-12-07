import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { TimerState, Preset } from '../types';

interface ControlsProps {
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSelectPreset: (minutes: number) => void;
  presets: Preset[];
  selectedMinutes: number;
}

export const Controls: React.FC<ControlsProps> = ({
  timerState,
  onStart,
  onPause,
  onReset,
  onSelectPreset,
  presets,
  selectedMinutes,
}) => {
  const isRunning = timerState === TimerState.RUNNING;

  return (
    <div className="flex flex-col gap-5 w-full z-10">

      {/* Time Selection Presets */}
      <div className={`grid grid-cols-3 gap-3 transition-all duration-300 ${timerState !== TimerState.IDLE ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
        {presets.map((preset) => {
          const isSelected = preset.minutes === selectedMinutes;
          return (
            <button
              key={preset.minutes}
              onClick={() => onSelectPreset(preset.minutes)}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all active:scale-95 ${isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-indigo-500/30 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{preset.minutes}</span>
              <span className={`text-xs font-medium ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>MINUTES</span>
            </button>
          );
        })}
      </div>

      {/* Main Action Buttons */}
      <div className="flex justify-center gap-4 items-center">

        {/* Reset Button (Only show if not IDLE) */}
        {timerState !== TimerState.IDLE && (
          <button
            onClick={onReset}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-800 border border-slate-700 hover:border-red-500/30 transition-all"
            title="リセット"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {/* Play/Pause Button */}
        {timerState === TimerState.IDLE ? (
          <button
            onClick={onStart}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95"
            title="集中を開始"
          >
            <Play className="w-7 h-7 fill-current ml-1" />
          </button>
        ) : (
          <button
            onClick={isRunning ? onPause : onStart}
            className={`flex items-center justify-center w-16 h-16 rounded-full text-white transition-all shadow-lg hover:scale-105 active:scale-95 ${isRunning
                ? 'bg-slate-700 hover:bg-slate-600'
                : 'bg-green-600 hover:bg-green-500 shadow-green-500/30'
              }`}
            title={isRunning ? "一時停止" : "再開"}
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>
        )}
      </div>

    </div>
  );
};