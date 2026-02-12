"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, StopCircle, Languages, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const [isTranslating, setIsTranslating] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "zh-CN"; // Set to Chinese

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript((prev) => prev + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setError(event.error);
          setIsRecording(false);
        };
        
        recognitionRef.current.onend = () => {
             // Do nothing specific on end
        };
      } else {
        setError("Browser does not support Speech Recognition.");
      }
    }
  }, []); // Remove isRecording dependency to prevent re-initialization

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      handleTranslate(transcript);
    } else {
      setTranscript("");
      setTranslation("");
      setError(null);
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleTranslate = async (text: string) => {
    if (!text.trim()) return;
    
    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTranslation(data.translation);
      } else {
        setError(data.error || 'Translation failed');
      }
    } catch (err) {
      setError('Failed to connect to translation service');
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="mb-12 text-center space-y-4 z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
            <Languages className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            GlobalEcho
            </h1>
        </div>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Instant Chinese to English Speech Translation
        </p>
      </header>

      {/* Main Interaction Area */}
      <div className="w-full max-w-4xl grid gap-8 z-10">
        
        {/* Microphone Button */}
        <div className="flex justify-center mb-8">
            <div className="relative">
                {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-neon animate-pulse-glow blur-md opacity-70"></div>
                )}
                <Button
                    onClick={toggleRecording}
                    className={`
                        relative w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300
                        ${isRecording 
                            ? "bg-neon text-black hover:bg-neon/90 hover:scale-105" 
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 border-2 border-primary/20"}
                    `}
                >
                    {isRecording ? (
                        <StopCircle className="w-12 h-12" />
                    ) : (
                        <Mic className="w-12 h-12" />
                    )}
                    <span className="text-xs font-bold tracking-widest uppercase">
                        {isRecording ? "Stop" : "Start"}
                    </span>
                </Button>
            </div>
        </div>

        {/* Status / Error */}
        {error && (
            <div className="text-center text-destructive bg-destructive/10 p-2 rounded-md mx-auto max-w-md">
                {error}
            </div>
        )}

        {/* Content Display */}
        <div className="grid md:grid-cols-2 gap-6">
            {/* Original Text (Chinese) */}
            <Card className="bg-card/50 backdrop-blur-md border-primary/10 h-[300px] flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Chinese (Original)
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    {transcript ? (
                        <p className="text-xl md:text-2xl leading-relaxed font-medium">
                            {transcript}
                        </p>
                    ) : (
                        <p className="text-muted-foreground/40 italic">
                            Waiting for speech...
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Translated Text (English) */}
            <Card className="bg-card/50 backdrop-blur-md border-primary/10 h-[300px] flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-neon flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        English (Translation)
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    {translation ? (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xl md:text-2xl leading-relaxed text-neon/90 font-light"
                        >
                            {translation}
                        </motion.p>
                    ) : isTranslating ? (
                        <div className="flex items-center gap-2 text-neon/70 animate-pulse">
                             <Sparkles className="w-4 h-4" />
                             Translating...
                        </div>
                    ) : (
                        <p className="text-muted-foreground/40 italic">
                            Translation will appear here...
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
