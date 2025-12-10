import React from 'react';
import { TimerState } from '../types';
import { Timer, Maximize2 } from 'lucide-react';

interface CompactViewProps {
    timerState: TimerState;
    timeLeft: number;
    onRestore: () => void;
    isPip?: boolean;
}

export const CompactView: React.FC<CompactViewProps> = ({
    timerState,
    timeLeft,
    onRestore,
    isPip = false,
}) => {
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`h-full w-full flex flex-col items-center justify-center bg-slate-950 p-4 overflow-hidden ${isPip ? 'absolute inset-0' : 'h-screen'}`}>
            {timerState === TimerState.RUNNING && (
                <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-base font-mono border border-slate-700 shadow-lg animate-pulse mb-6 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-400 font-sans">REMAINING</span>
                    {formatTime(timeLeft)}
                </div>
            )}

            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={onRestore}
                    className="group relative w-20 h-20 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-slate-900 ring-2 ring-indigo-500/50 z-50 cursor-pointer"
                    title={isPip ? "元のサイズに戻す" : "元に戻す"}
                >
                    {timerState === TimerState.RUNNING ? (
                        <>
                            <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-20"></span>
                            <Maximize2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        </>
                    ) : (
                        <Timer className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    )}
                </button>

            </div>
        </div>
    );
};
