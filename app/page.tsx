"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw, Bell, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const DEFAULT_TIME = 8; // Changed to 8 seconds
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [isActive, setIsActive] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [showMessage, setShowMessage] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  const handleComplete = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Show text instead of vibration/notification
    setShowMessage(true);
  }, []);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, handleComplete]);

  const toggleTimer = () => {
    if (!isActive && timeLeft === 0) {
      setTimeLeft(DEFAULT_TIME);
      setShowMessage(false);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(DEFAULT_TIME);
    setShowMessage(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((DEFAULT_TIME - timeLeft) / DEFAULT_TIME) * 100;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white relative">
      {/* Background Ring Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div 
          className="w-[80vw] h-[80vw] rounded-full border-[1px] border-white/20 transition-all duration-1000"
          style={{ transform: `scale(${1 + (progress / 100) * 0.5})` }}
        ></div>
        <div 
           className="absolute w-[60vw] h-[60vw] rounded-full border-[1px] border-white/10 transition-all duration-1000 delay-75"
           style={{ transform: `scale(${1 + (progress / 100) * 0.3})` }}
        ></div>
      </div>

      {/* Main Display */}
      <div className="z-10 flex flex-col items-center gap-12 w-full max-w-md px-6">
        
        {/* Permission Request (if needed) */}
        {permission === "default" && (
          <Button 
            variant="ghost" 
            onClick={requestPermission}
            className="absolute top-8 right-8 text-white/50 hover:text-white hover:bg-white/10"
          >
            <Bell className="w-5 h-5 mr-2" />
            Enable Notify
          </Button>
        )}

        {/* Timer */}
        <div className="relative flex items-center justify-center">
          {/* Progress Circle SVG */}
          <svg className="w-72 h-72 transform -rotate-90">
            <circle
              cx="144"
              cy="144"
              r="130"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-white/10"
            />
            <circle
              cx="144"
              cy="144"
              r="130"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 130}
              strokeDashoffset={2 * Math.PI * 130 * (1 - (DEFAULT_TIME - timeLeft) / DEFAULT_TIME)}
              className="text-green-500 transition-all duration-1000 ease-linear"
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute text-center">
            {showMessage ? (
              <div className="px-4 animate-in fade-in zoom-in duration-500">
                <h1 className="text-3xl font-bold text-pink-500 text-center leading-relaxed">
                  王媛媛<br/>你真好看！
                </h1>
              </div>
            ) : (
              <>
                <h1 className="text-7xl font-light tracking-tighter tabular-nums">
                  {formatTime(timeLeft)}
                </h1>
                <p className="text-white/40 mt-2 text-sm uppercase tracking-widest">
                  {isActive ? "Focusing..." : timeLeft === 0 ? "Done" : "Ready"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-6">
          <Button
            onClick={toggleTimer}
            size="lg"
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isActive 
                ? "bg-transparent border-2 border-white/20 hover:bg-white/10 hover:border-white/40" 
                : "bg-white text-black hover:bg-white/90 hover:scale-105"
            }`}
          >
            {isActive ? (
               <div className="w-6 h-6 bg-white rounded-sm" /> 
            ) : (
               <Play className="w-8 h-8 ml-1" fill="currentColor" />
            )}
          </Button>

          <Button
            onClick={resetTimer}
            size="lg"
            variant="ghost"
            className="w-20 h-20 rounded-full border-2 border-transparent text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Install Hint */}
      <div className="absolute bottom-8 text-center px-6 opacity-40 text-xs">
        <p className="flex items-center justify-center gap-2 mb-2">
            <Smartphone className="w-4 h-4" />
            <span>Install App</span>
        </p>
        <p>Tap &quot;Share&quot; {'>'} &quot;Add to Home Screen&quot;</p>
      </div>
    </main>
  );
}
