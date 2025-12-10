import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { TimerState, Preset } from './types';
import { CircularProgress } from './components/CircularProgress';
import { Controls } from './components/Controls';
import { useSound } from './hooks/useSound';
import { Bell, Maximize2, Minimize2, Timer, PictureInPicture, X } from 'lucide-react';

const PRESETS: Preset[] = [
  { label: '30分', minutes: 30 },
  { label: '45分', minutes: 45 },
  { label: '1時間', minutes: 60 },
];

// --- TimerView Component ---
interface TimerViewProps {
  timerState: TimerState;
  timeLeft: number;
  progress: number;
  selectedMinutes: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onPresetSelect: (minutes: number) => void;
  onMinimize?: () => void;
  onTogglePip?: () => void;
  isPipMode: boolean;
  isInPip?: boolean;
}

const TimerView: React.FC<TimerViewProps> = ({
  timerState,
  timeLeft,
  progress,
  selectedMinutes,
  onStart,
  onPause,
  onReset,
  onPresetSelect,
  onMinimize,
  onTogglePip,
  isPipMode,
  isInPip = false,
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };


  return (
    <div className={`flex flex-col relative w-full h-full transition-all duration-300 overflow-hidden
      ${isInPip
        ? 'bg-slate-950'
        : 'bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-3xl shadow-2xl'
      }`}>

      {/* Header / Top Bar */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900/50 border-b border-slate-800/50 drag-handle">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-slate-200 text-sm tracking-wide">ZenFocus</span>
        </div>
        <div className="flex items-center gap-1">
          {/* PiP Button */}
          {onTogglePip && (
            <button
              onClick={onTogglePip}
              className={`p-1.5 hover:bg-slate-800 rounded-full transition-colors ${isPipMode ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
              title={isPipMode ? "ウィンドウに戻す" : "ポップアップ表示 (PiP)"}
            >
              <PictureInPicture className="w-4 h-4" />
            </button>
          )}

          {/* Minimize Button (Hide in PiP) */}
          {!isInPip && onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col items-center gap-6 flex-1 justify-center">

        {/* Timer Display */}
        <div className="relative">
          <CircularProgress
            progress={timerState === TimerState.IDLE ? 0 : (timerState === TimerState.FINISHED ? 100 : progress)}
            size={isInPip ? 180 : 220}
            strokeWidth={6}
          >
            <div className="text-center space-y-1">
              <div className={`${isInPip ? 'text-4xl' : 'text-5xl'} font-mono font-bold tracking-tighter text-white tabular-nums`}>
                {formatTime(timeLeft)}
              </div>
              <div className={`text-xs font-bold uppercase tracking-widest ${timerState === TimerState.RUNNING ? 'text-green-400 animate-pulse' :
                timerState === TimerState.PAUSED ? 'text-yellow-400' :
                  timerState === TimerState.FINISHED ? 'text-indigo-400' : 'text-slate-500'
                }`}>
                {timerState === TimerState.RUNNING ? '集中中' :
                  (timerState === TimerState.PAUSED ? '一時停止' :
                    (timerState === TimerState.FINISHED ? '完了' : '待機中'))}
              </div>
            </div>
          </CircularProgress>
        </div>

        {/* Controls */}
        <Controls
          timerState={timerState}
          onStart={onStart}
          onPause={onPause}
          onReset={onReset}
          onSelectPreset={onPresetSelect}
          presets={PRESETS}
          selectedMinutes={selectedMinutes}
        />

        {/* Finished Alert Overlay */}
        {timerState === TimerState.FINISHED && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-20 animate-in fade-in zoom-in text-center p-6 backdrop-blur-sm">
            <Bell className="w-12 h-12 text-indigo-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-2">時間です！</h3>
            <p className="text-slate-400 text-sm mb-6">お疲れ様でした。<br />少し休憩しましょう。</p>
            <button
              onClick={onReset}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
            >
              閉じる
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

const App: React.FC = () => {
  // UI State
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isStandaloneMode, setIsStandaloneMode] = useState<boolean>(false);

  // Timer State
  const [timerState, setTimerState] = useState<TimerState>(TimerState.IDLE);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60);

  // Refs
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Custom Hooks
  const { playBeep } = useSound();

  // Initialize Notification permission and check standalone mode
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandaloneMode(isStandalone);
    };

    checkStandalone();
    window.addEventListener('resize', checkStandalone); // Sometimes display-mode changes on resize/mode switch behavior
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  // Timer Logic
  useEffect(() => {
    if (timerState === TimerState.RUNNING) {
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState]);

  const handleFinish = () => {
    setTimerState(TimerState.FINISHED);
    playBeep();
    // Ensure UI is visible
    if (pipWindow) {
      pipWindow.focus();
    } else {
      setIsOpen(true);
    }

    if (Notification.permission === 'granted') {
      new Notification("時間になりました！", {
        body: "お疲れ様でした。少し休憩しましょう。",
      });
    }
  };

  const handleStart = () => setTimerState(TimerState.RUNNING);
  const handlePause = () => setTimerState(TimerState.PAUSED);
  const handleReset = () => {
    setTimerState(TimerState.IDLE);
    setTimeLeft(selectedMinutes * 60);
  };
  const handlePresetSelect = (minutes: number) => {
    setSelectedMinutes(minutes);
    setTimeLeft(minutes * 60);
    setTimerState(TimerState.IDLE);
  };

  // PiP Handler
  const togglePip = useCallback(async () => {
    if (pipWindow) {
      // Close PiP
      pipWindow.close();
      setPipWindow(null);
    } else {
      // Open PiP
      if (!('documentPictureInPicture' in window)) {
        alert("お使いのブラウザはPicture-in-Picture APIに対応していません。");
        return;
      }

      try {
        // @ts-ignore - TS doesn't fully know documentPictureInPicture yet
        const win = await window.documentPictureInPicture.requestWindow({
          width: 360,
          height: 600,
        });

        // Copy styles
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            win.document.head.appendChild(style);
          } catch (e) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = styleSheet.type;
            link.media = styleSheet.media.mediaText || '';
            link.href = styleSheet.href || '';
            win.document.head.appendChild(link);
          }
        });

        // Handle PiP close
        win.addEventListener('pagehide', () => {
          setPipWindow(null);
        });

        setPipWindow(win);
      } catch (err) {
        console.error("Failed to open PiP", err);
      }
    }
  }, [pipWindow]);

  const totalSeconds = selectedMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  const timerViewProps = {
    timerState,
    timeLeft,
    progress,
    selectedMinutes,
    onStart: handleStart,
    onPause: handlePause,
    onReset: handleReset,
    onPresetSelect: handlePresetSelect,
    onTogglePip: togglePip,
    isPipMode: !!pipWindow,
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Render to PiP Window (Portal)
  const pipPortal = pipWindow
    ? ReactDOM.createPortal(
      <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-100 p-4">
        <TimerView {...timerViewProps} isInPip={true} />
      </div>,
      pipWindow.document.body
    )
    : null;

  // Show Minimized/Widget View if:
  // 1. Manually minimized (!isOpen)
  // 2. PiP is active (pipWindow is set) - effectively "minimized" to background
  const showMinimized = !isOpen || !!pipWindow;

  if (showMinimized) {
    return (
      <>
        {pipPortal}
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 p-4 overflow-hidden">
          {timerState === TimerState.RUNNING && (
            <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-base font-mono border border-slate-700 shadow-lg animate-pulse mb-6 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400 font-sans">REMAINING</span>
              {formatTime(timeLeft)}
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => {
                if (pipWindow) {
                  // If in PiP, clicking this button restores the window (closes PiP)
                  togglePip();
                } else {
                  // Normal restore
                  setIsOpen(true);
                }
              }}
              className="group relative w-20 h-20 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-slate-900 ring-2 ring-indigo-500/50 z-50"
              title="元に戻す"
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

            <p className="text-slate-500 text-sm font-medium animate-pulse">
              {pipWindow ? 'タイマー分離中' : '最小化中'}
            </p>
          </div>
        </div>
      </>
    );
  }

  // --- Standard View ---
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-[360px] animate-in slide-in-from-bottom-10 fade-in duration-300 font-sans">
        <TimerView
          {...timerViewProps}
          onMinimize={isStandaloneMode ? undefined : () => setIsOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;