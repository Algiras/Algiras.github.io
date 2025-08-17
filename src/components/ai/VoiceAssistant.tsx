import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Group, Progress, Stack, Text, Title, Textarea, useMantineColorScheme, Select, Slider } from '@mantine/core';
import { getSharedEngine } from '../../lib/webllmEngine';
import { useMachine } from '@xstate/react';
import { assistantMachine } from './assistantMachine';
import { voiceStateMachine } from './voiceStateMachine';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const checkCompatibility = (): string[] => {
  const issues: string[] = [];
  if (!(navigator as any).gpu) {
    issues.push('WebGPU not supported - Chrome/Edge with WebGPU recommended');
  }
  const hasRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!hasRecognition) {
    issues.push('Speech Recognition not supported');
  }
  if (!window.speechSynthesis) {
    issues.push('Speech Synthesis not supported');
  }
  return issues;
};

const preferredVoice = (voices: any[]): any | undefined => {
  return (
    voices.find(v => v.name.includes('Google')) ||
    voices.find(v => v.name.includes('Microsoft')) ||
    voices.find(v => v.lang?.toLowerCase().startsWith('en'))
  );
};

const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: number | undefined;
  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error('timeout')), ms);
      }) as Promise<T>,
    ]);
  } finally {
    if (timer) window.clearTimeout(timer);
  }
};

const VoiceAssistant: React.FC = () => {
  // Theme detection
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Theme-aware styling
  const getCardStyle = useMemo(() => ({
    backgroundColor: isDark ? 'rgba(37, 38, 43, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(10px)',
    border: isDark ? '1px solid rgba(55, 58, 64, 0.6)' : '1px solid rgba(233, 236, 239, 0.6)'
  }), [isDark]);
  
  const getStatusStyle = useMemo(() => (type: 'loading' | 'ready' | 'error') => ({
    backgroundColor: type === 'error' 
      ? (isDark ? 'rgba(250, 82, 82, 0.15)' : 'rgba(255, 107, 107, 0.1)')
      : type === 'ready' 
        ? (isDark ? 'rgba(64, 192, 87, 0.15)' : 'rgba(18, 184, 134, 0.1)')
        : (isDark ? 'rgba(116, 192, 252, 0.15)' : 'rgba(74, 144, 226, 0.1)'),
    border: `1px solid ${type === 'error' 
      ? (isDark ? 'rgba(250, 82, 82, 0.25)' : 'rgba(255, 107, 107, 0.2)')
      : type === 'ready' 
        ? (isDark ? 'rgba(64, 192, 87, 0.25)' : 'rgba(18, 184, 134, 0.2)')
        : (isDark ? 'rgba(116, 192, 252, 0.25)' : 'rgba(74, 144, 226, 0.2)')}`
  }), [isDark]);
  
  const getChatStyle = useMemo(() => ({
    backgroundColor: isDark ? 'rgba(26, 27, 30, 0.6)' : 'rgba(248, 249, 250, 0.6)',
    border: isDark ? '1px solid rgba(55, 58, 64, 0.5)' : '1px solid rgba(233, 236, 239, 0.5)'
  }), [isDark]);
  
  const getInputStyle = useMemo(() => ({
    backgroundColor: isDark ? 'rgba(55, 58, 64, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    border: isDark ? '1px solid rgba(55, 58, 64, 0.6)' : '1px solid rgba(233, 236, 239, 0.6)',
    boxShadow: isDark ? '0 2px 12px rgba(0, 0, 0, 0.15)' : '0 2px 12px rgba(0, 0, 0, 0.05)'
  }), [isDark]);
  
  const getTranscriptStyle = useMemo(() => ({
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 246, 255, 0.6)',
    border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(191, 219, 254, 0.5)'
  }), [isDark]);
  
  const [engine, setEngine] = useState<any | null>(null);
  const [isEngineInitializing, setIsEngineInitializing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Checking WebLLM compatibility...');
  const [statusType, setStatusType] = useState<'loading' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState<number>(0);
  // FSM replaces individual state variables
  // const [isListening, setIsListening] = useState<boolean>(false);
  // const [isProcessing, setIsProcessing] = useState<boolean>(false);
  // const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [conversationMode, setConversationMode] = useState<boolean>(false);
  const [assistantState, sendAssistant] = useMachine(assistantMachine);
  const conversationHistory = assistantState.context.history as ChatMessage[];
  const transcript = assistantState.context.transcript as string;
  const response = assistantState.context.response as string;
  
  // Voice State Machine - replaces isListening, isSpeaking, isProcessing
  const [voiceState, sendVoice] = useMachine(voiceStateMachine);
  
  // Helper functions to check FSM state
  const isListening = voiceState.matches('listening');
  const isSpeaking = voiceState.matches('speaking');  
  const isProcessing = voiceState.matches('processing');
  
  const [manualInput, setManualInput] = useState<string>('');
  const [systemPrompt, setSystemPrompt] = useState<string>('You are a helpful AI assistant. Provide clear, concise, and accurate responses.');
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [/* micPermission */, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [isSwitchingModel, setIsSwitchingModel] = useState<boolean>(false);
  
  // Voice configuration
  const [voiceConfig, setVoiceConfig] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voice: null as any,
    language: navigator.language || 'en-US'
  });
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  
  // Memory management configuration
  const [memoryConfig, setMemoryConfig] = useState({
    maxMessages: 20, // Maximum messages before summarization
    summaryTrigger: 16, // Start summarization when reaching this count
    keepRecentMessages: 6, // Always keep this many recent messages
    enableAutoSummary: true
  });
  
  // Conversation memory state
  const [conversationSummary, setConversationSummary] = useState<string>('');

  // Model configuration
  const [modelConfig, setModelConfig] = useState({
    selectedModel: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
    availableModels: [
      { id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC', name: 'Llama 3.2 3B (Fast)', size: '~2GB' },
      { id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', name: 'Llama 3.2 1B (Ultra Fast)', size: '~1GB' },
      { id: 'Phi-3.5-mini-instruct-q4f16_1-MLC', name: 'Phi 3.5 Mini (Balanced)', size: '~2GB' },
      { id: 'Qwen2.5-3B-Instruct-q4f32_1-MLC', name: 'Qwen 2.5 3B (Multilingual)', size: '~2GB' },
      { id: 'gemma-2-2b-it-q4f16_1-MLC', name: 'Gemma 2 2B (Google)', size: '~1.5GB' },
      { id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC', name: 'Mistral 7B (Advanced)', size: '~4GB' }
    ]
  });

  const recognitionRef = useRef<any | null>(null);
  const autoListenTimeoutRef = useRef<number | null>(null);
  const processUserInputRef = useRef<(text: string) => void>(() => {});
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const log = useCallback((message: string) => {
    const entry = `[${new Date().toLocaleTimeString()}] ${message}`;
    // eslint-disable-next-line no-console
    console.log(entry);
    // Debug UI removed for cleaner interface
  }, []);

  // Summarize conversation history
  const summarizeConversation = useCallback(async (messages: Array<{role: string, content: string}>) => {
    if (!engine || !memoryConfig.enableAutoSummary) return '';
    
    try {
      log('Summarizing conversation history...');
      
      // Create a prompt to summarize the conversation
      const summaryPrompt = `Please provide a concise summary of this conversation, focusing on key topics, decisions, and important context that should be remembered for future responses. Keep it under 200 words.

Conversation to summarize:
${messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}

Summary:`;

      const summaryMessages = [
        { role: 'system', content: 'You are a helpful assistant that creates concise conversation summaries.' },
        { role: 'user', content: summaryPrompt }
      ];

      const summaryReply = await withTimeout(
        engine.chat.completions.create({
          messages: summaryMessages,
          stream: false,
          max_tokens: 300,
          temperature: 0.3
        }),
        30000 // 30 second timeout for summary
      );

      const summary = (summaryReply as any)?.choices?.[0]?.message?.content?.trim() || '';
      log(`Generated conversation summary: ${summary.substring(0, 100)}...`);
      return summary;
      
    } catch (error: any) {
      const errorMsg = error?.message || String(error) || 'Unknown error';
      log(`Failed to summarize conversation: ${errorMsg}`);
      
      // Special handling for VectorInt errors in summarization
      if (errorMsg.includes('VectorInt') || errorMsg.includes('vector') || errorMsg.includes('Vector')) {
        log('Detected VectorInt error in summarization, attempting recovery...');
        try {
          // Retry with very simple summarization request
          const simpleMessages: ChatMessage[] = [
            { role: 'system', content: 'Summarize briefly.' },
            { role: 'user', content: 'Please provide a brief summary of the conversation.' }
          ];
          const retryReply = await withTimeout(
            engine.chat.completions.create({
              messages: simpleMessages,
              max_tokens: 50,
              temperature: 0.1
            }),
            15000
          );
          const summary = (retryReply as any)?.choices?.[0]?.message?.content?.trim() || '';
          log(`Summary recovery successful: ${summary}`);
          return summary;
        } catch (retryError: any) {
          log(`Summary recovery failed: ${retryError?.message || retryError}`);
        }
      }
      
      return '';
    }
  }, [engine, memoryConfig.enableAutoSummary, log]);

  // Manage conversation memory and trigger summarization when needed
  const manageConversationMemory = useCallback(async (currentHistory: Array<{role: string, content: string}>) => {
    if (!memoryConfig.enableAutoSummary || currentHistory.length < memoryConfig.summaryTrigger) {
      return currentHistory;
    }

    log(`Conversation has ${currentHistory.length} messages, triggering memory management...`);

    // Get messages to summarize (exclude the most recent ones)
    const recentMessages = currentHistory.slice(-memoryConfig.keepRecentMessages);
    const messagesToSummarize = currentHistory.slice(0, -memoryConfig.keepRecentMessages);

    if (messagesToSummarize.length === 0) {
      return currentHistory;
    }

    // Generate summary of older messages
    const newSummary = await summarizeConversation(messagesToSummarize);
    
    if (newSummary) {
      // Combine with existing summary if any
      const combinedSummary = conversationSummary 
        ? `Previous context: ${conversationSummary}\n\nRecent summary: ${newSummary}`
        : newSummary;
      
      setConversationSummary(combinedSummary);
      log(`Updated conversation summary. Reduced ${messagesToSummarize.length} messages to summary.`);
      
      // Return only recent messages (summary will be added to context in processUserInput)
      return recentMessages;
    }

    return currentHistory;
  }, [memoryConfig, conversationSummary, summarizeConversation, log]);

  // Load available voices and set locale-based defaults
  const loadVoices = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);
    
    if (voices.length > 0 && !voiceConfig.voice) {
      // Try to find a voice that matches the user's language
      const userLang = voiceConfig.language.split('-')[0]; // e.g., 'en' from 'en-US'
      const matchingVoice = voices.find(voice => 
        voice.lang.toLowerCase().startsWith(userLang.toLowerCase())
      ) || voices.find(voice => voice.default) || voices[0];
      
      setVoiceConfig(prev => ({
        ...prev,
        voice: matchingVoice
      }));
      
      log(`Voice set to: ${matchingVoice.name} (${matchingVoice.lang})`);
    }
  }, [voiceConfig.language, voiceConfig.voice, log]);

  const updateStatus = useCallback((message: string, type: 'loading' | 'ready' | 'error' = 'loading') => {
    setStatus(message);
    setStatusType(type);
    log(`Status: ${message} (${type})`);
  }, [log]);

  const clearAutoListenTimeout = useCallback(() => {
    if (autoListenTimeoutRef.current) {
      window.clearTimeout(autoListenTimeoutRef.current);
      autoListenTimeoutRef.current = null;
    }
  }, []);

  // FSM-based auto-listen: Just send START_LISTENING event
  const scheduleAutoListen = useCallback((delay = 1200) => {
    if (!conversationMode) return;
    
    clearAutoListenTimeout();
    autoListenTimeoutRef.current = window.setTimeout(() => {
      log(`Auto-listen: Restarting listening (conversation mode)`);
      
      // Stop any existing recognition
      try { recognitionRef.current?.stop(); } catch (e) { void e; }
      
      // Send FSM event to start listening
      sendVoice({ type: 'START_LISTENING' });
      
      // Wait a moment then actually start recognition
      setTimeout(() => {
        if (conversationMode) {
          log(`Auto-listen: Starting fresh recognition`);
          try { 
            recognitionRef.current?.start(); 
          } catch (e) { 
            log(`Auto-listen failed: ${e}`);
          }
        }
      }, 100);
    }, delay);
  }, [clearAutoListenTimeout, conversationMode, log, sendVoice]);



  const initializeRecognition = useCallback(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      updateStatus('Speech recognition not supported in this browser', 'error');
      return;
    }
    
    // Stop any existing recognition first
    try {
      if (recognitionRef.current) {
        log('initializeRecognition: stopping existing recognition');
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
    } catch (e) {
      log(`initializeRecognition: failed to stop existing: ${e}`);
    }
    
    const recognition = new SR();
    log('initializeRecognition: created new recognition object');
    recognition.continuous = false;
    recognition.interimResults = false;
    try { recognition.maxAlternatives = 1; } catch { /* noop */ }
    recognition.lang = voiceConfig.language;

    recognition.onstart = () => {
      log('Speech recognition started');
      // FSM handles state transition automatically when START_LISTENING was sent
      sendAssistant({ type: 'SET_TRANSCRIPT', content: 'Listening...' });
      // Stop any ongoing speech
      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    };
    recognition.onend = () => {
      log('Speech recognition ended');
      // Don't send event here - let the speech result or error handle transitions
      // In conversation mode, schedule restart
      if (conversationMode) {
        scheduleAutoListen(800);
      }
    };
    recognition.onerror = (event: any) => {
      const err: string = event?.error ?? 'unknown';
      log(`Speech recognition error: ${err}`);
      sendVoice({ type: 'SPEECH_ERROR', error: err });
      
      if (err === 'no-speech') {
        updateStatus('No speech detected', 'error');
        if (conversationMode) scheduleAutoListen(2000);
      } else if (err === 'not-allowed' || err === 'service-not-allowed') {
        updateStatus('Microphone access denied', 'error');
        setMicPermission('denied');
      } else if (err === 'aborted') {
        // user stopped; no status change
      } else if (err === 'network') {
        updateStatus('Network error', 'error');
      } else {
        updateStatus(`Speech recognition error: ${err}`, 'error');
      }
    };
    recognition.onresult = (event: any) => {
      try {
        const results: any = event?.results;
        const idx = typeof event?.resultIndex === 'number' && event.resultIndex >= 0
          ? event.resultIndex
          : (results?.length ?? 1) - 1;
        const alt0 = results?.[idx]?.[0];
        const raw = alt0?.transcript ?? '';
        const text = String(raw).trim();
        if (text) {
          sendVoice({ type: 'SPEECH_DETECTED', transcript: text });
          sendAssistant({ type: 'SET_TRANSCRIPT', content: `You said: "${text}"` });
          log(`Speech recognized: "${text}"`);
          void processUserInputRef.current(text);
        }
      } catch {
        // fallback to previous logic if structure unexpected
        const text = event?.results?.[0]?.[0]?.transcript ?? '';
        const t = String(text).trim();
        if (t) {
          sendVoice({ type: 'SPEECH_DETECTED', transcript: t });
          sendAssistant({ type: 'SET_TRANSCRIPT', content: `You said: "${t}"` });
          log(`Speech recognized (fallback): "${t}"`);
          void processUserInputRef.current(t);
        }
      }
    };
    recognitionRef.current = recognition;
  }, [conversationMode, log, scheduleAutoListen, updateStatus]);

  const initializeEngine = useCallback(async (selectedModel?: string) => {
    if (engine || isEngineInitializing) {
      log('Engine already initialized or initializing, skipping');
      return;
    }
    
    setIsEngineInitializing(true);
    try {
      const modelToUse = selectedModel || modelConfig.selectedModel;
      updateStatus(`Loading AI engine (${modelConfig.availableModels.find(m => m.id === modelToUse)?.name || modelToUse})...`, 'loading');
      log(`Getting shared WebLLM engine with model: ${modelToUse}`);
      const loaded = await getSharedEngine((p: any) => {
        const percent = Math.round((p?.progress ?? 0) * 100);
        setProgress(percent);
        updateStatus(`Downloading model... ${percent}%`, 'loading');
      }, modelToUse);
      setEngine(loaded);
      setProgress(100);
      updateStatus('Ready', 'ready');
    } catch (e: any) {
      log(`WebLLM initialization failed: ${e?.message ?? e}`);
      // Device does not support WebLLM
      setEngine(null);
      updateStatus('Device Not Supported', 'error');
      sendAssistant({ type: 'ADD_ASSISTANT', content: '⚠️ Your device does not support on-device AI processing. This requires WebGPU and sufficient memory. Voice recognition will still work, but AI responses are not available.' });
    } finally {
      setIsEngineInitializing(false);
    }
  }, [engine, isEngineInitializing, log, updateStatus, modelConfig]);

  const speakResponse = useCallback((text: string) => {
    try { 
      window.speechSynthesis.cancel(); 
      // FSM will handle state when STOP_EVERYTHING is sent
    } catch (e) { void e; }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice configuration
    utterance.rate = voiceConfig.rate;
    utterance.pitch = voiceConfig.pitch;
    utterance.volume = voiceConfig.volume;
    utterance.lang = voiceConfig.language;
    
    // Apply voice selection - user's choice takes priority
    if (voiceConfig.voice) {
      utterance.voice = voiceConfig.voice;
    } else {
      // Fallback voice selection only if no voice configured
      const voices = window.speechSynthesis.getVoices();
      const voice = preferredVoice(voices);
      if (voice) utterance.voice = voice;
    }
    
    // Set up event handlers
    utterance.onstart = () => {
      log('Speech started');
      sendVoice({ type: 'START_SPEAKING' });
    };
    
    utterance.onend = () => {
      log('Speech ended');
      sendVoice({ type: 'SPEECH_ENDED' });
      if (conversationMode) scheduleAutoListen(800);
    };
    
    utterance.onerror = (event) => {
      log(`Speech error: ${event.error}`);
      sendVoice({ type: 'SPEECH_ENDED' }); // Treat error as ended
      if (conversationMode) scheduleAutoListen(1000);
    };
    
    utterance.onpause = () => {
      log('Speech paused');
      // Keep speaking state - just paused
    };
    
    utterance.onresume = () => {
      log('Speech resumed');
      // Already in speaking state
    };
    
    // Add a safety timeout to ensure speaking state is cleared - smart timeout based on text length
    const estimatedDuration = Math.max(text.length * 100, 5000); // 100ms per character, minimum 5 seconds
    const maxTimeout = Math.min(estimatedDuration, 30000); // Cap at 30 seconds for very long text
    const safetyTimeout = setTimeout(() => {
      log(`Speech safety timeout after ${maxTimeout}ms - forcibly clearing speaking state`);
      window.speechSynthesis.cancel(); // Force stop any speech
      sendVoice({ type: 'SPEECH_ENDED' }); // FSM handles state
    }, maxTimeout);
    
    // Clear timeout when speech ends
    const originalOnEnd = utterance.onend;
    utterance.onend = (event) => {
      clearTimeout(safetyTimeout);
      if (originalOnEnd) originalOnEnd.call(utterance, event);
    };
    
    const originalOnError = utterance.onerror;
    utterance.onerror = (event) => {
      clearTimeout(safetyTimeout);
      if (originalOnError) originalOnError.call(utterance, event);
    };
    
    window.speechSynthesis.speak(utterance);
    log(`Started speaking: "${text.substring(0, 50)}..." (${text.length} chars, ${maxTimeout}ms timeout)`);
  }, [conversationMode, scheduleAutoListen, log, sendVoice]);

  const processUserInput = useCallback(async (text: string) => {
    if (!engine) { 
      log('processUserInput skipped: AI not supported on this device'); 
      sendAssistant({ type: 'ADD_ASSISTANT', content: '⚠️ AI responses are not available on this device. Your voice was recognized, but AI processing requires WebGPU support.' });
      updateStatus('AI Not Available', 'error');
      return; 
    }
    if (isProcessing) { log('processUserInput skipped: already processing'); return; }
    
    // Check if this is a duplicate of the last message
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage?.role === 'user' && lastMessage.content === text) {
      log('processUserInput skipped: duplicate message');
      return;
    }
    
    sendVoice({ type: 'START_PROCESSING' });
    updateStatus('Thinking...', 'loading');
    log(`Processing user input: "${text}"`);
    
    // Add user message to history
    log(`Sending ADD_USER event: "${text}"`);
    sendAssistant({ type: 'ADD_USER', content: text });
    
    // Build messages for API call with memory management
    const nextHistory: ChatMessage[] = [...conversationHistory, { role: 'user', content: text }];
    
    // Apply memory management before sending to LLM
    const managedHistory = await manageConversationMemory(nextHistory);
    
    try {
      const messages: ChatMessage[] = [
        { role: 'system' as const, content: systemPrompt },
        // Add conversation summary as context if available
        ...(conversationSummary ? [{ role: 'system' as const, content: `Previous conversation context: ${conversationSummary}` }] : []),
        ...managedHistory as ChatMessage[]
      ];
      const reply: any = await withTimeout(engine.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 200
      }), 45000);
      const content: string = (reply as any)?.choices?.[0]?.message?.content ?? 'Sorry, I had trouble responding.';
      sendVoice({ type: 'LLM_RESPONSE', response: content });
      sendAssistant({ type: 'ADD_ASSISTANT', content });
      if (conversationMode) {
        updateStatus('Speaking...', 'loading');
      } else {
        updateStatus('Ready', 'ready');
      }
      speakResponse(content);
    } catch (e: any) {
      const msg = e?.message || String(e) || 'Unknown error';
      log(`AI processing error: ${msg}`);
      
      // Special handling for VectorInt errors - try simpler parameters
      if (msg.includes('VectorInt') || msg.includes('vector') || msg.includes('Vector')) {
        log('Detected VectorInt error, attempting recovery with simpler parameters...');
        try {
          // Retry with simpler parameters and shorter messages
          const simpleMessages: ChatMessage[] = [
            { role: 'system' as const, content: 'You are a helpful assistant. Keep responses brief.' },
            { role: 'user' as const, content: text.substring(0, 100) } // Truncate input
          ];
          const retryReply: any = await withTimeout(engine.chat.completions.create({
            messages: simpleMessages,
            temperature: 0.5,
            max_tokens: 100 // Reduce token limit
          }), 30000);
          const retryContent: string = (retryReply as any)?.choices?.[0]?.message?.content ?? 'I apologize, but I had trouble processing that request.';
          log(`Recovery successful: ${retryContent}`);
          sendVoice({ type: 'LLM_RESPONSE', response: retryContent });
          sendAssistant({ type: 'ADD_ASSISTANT', content: retryContent });
          if (conversationMode) {
            updateStatus('Speaking...', 'loading');
          } else {
            updateStatus('Ready', 'ready');
          }
          speakResponse(retryContent);
          return; // Success, exit early
        } catch (retryError: any) {
          log(`Recovery attempt failed: ${retryError?.message || retryError}`);
        }
      }
      
      // If recovery failed or wasn't attempted, show error
      sendVoice({ type: 'LLM_ERROR', error: msg });
      sendAssistant({ type: 'ADD_ASSISTANT', content: `Sorry, I encountered an error. (${msg})` });
      updateStatus('Processing error', 'error');
      if (conversationMode) scheduleAutoListen(2000);
    } finally {
      // FSM handles processing state automatically
      // Don't schedule auto-listen here - let TTS onend handle it
      // This prevents multiple conflicting scheduleAutoListen calls
    }
  }, [conversationHistory, conversationMode, engine, isProcessing, log, scheduleAutoListen, speakResponse, updateStatus, sendVoice, systemPrompt, manageConversationMemory, conversationSummary]);

  useEffect(() => {
    processUserInputRef.current = (t: string) => { void processUserInput(t); };
  }, [processUserInput]);





  const startConversation = useCallback(() => {
    if (!engine) return;
    setConversationMode(true);
    sendVoice({ type: 'START_LISTENING' });
    updateStatus('Listening...', 'loading');
    try { recognitionRef.current?.start(); } catch (e) { void e; }
  }, [engine, updateStatus, sendVoice]);

  const stopSpeech = useCallback(() => {
    try { 
      window.speechSynthesis.cancel(); 
      sendVoice({ type: 'STOP_EVERYTHING' });
      log('Speech forcibly stopped');
    } catch (e) { 
      log(`Error stopping speech: ${e}`);
      sendVoice({ type: 'STOP_EVERYTHING' });
    }
  }, [log, sendVoice]);

  const clearHistory = useCallback(() => {
    // Stop any ongoing conversation activities
    sendVoice({ type: 'STOP_EVERYTHING' });
    
    // Stop speech synthesis
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore errors
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore errors
      }
    }
    
    // Clear conversation history and reset state
    sendAssistant({ type: 'CLEAR' });
    updateStatus('Ready', 'ready');
    
    // Turn off conversation mode
    setConversationMode(false);
    
    log('Conversation cleared and stopped');
  }, [updateStatus, sendVoice, log]);

  const changeModel = useCallback(async (newModelId: string) => {
    if (newModelId === modelConfig.selectedModel) return;
    
    try {
      setIsSwitchingModel(true);
      
      // Clear current engine
      setEngine(null);
      setIsEngineInitializing(false);
      
      // Update model config
      setModelConfig(prev => ({ ...prev, selectedModel: newModelId }));
      
      // Initialize new engine
      updateStatus('Switching models...', 'loading');
      await initializeEngine(newModelId);
      
      log(`Successfully switched to model: ${newModelId}`);
    } catch (error: any) {
      log(`Failed to switch models: ${error?.message || error}`);
      updateStatus('Model switch failed', 'error');
    } finally {
      setIsSwitchingModel(false);
    }
  }, [modelConfig.selectedModel, initializeEngine, log, updateStatus]);

  // Initialize voices
  useEffect(() => {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]);

  // Initialize on mount
  useEffect(() => {
    // Only initialize once
    if (engine) return;
    
    const issues = checkCompatibility();
    if (issues.length) {
      updateStatus('Browser compatibility issues detected', 'error');
      issues.forEach(i => log(i));
      // still attempt to init recognition so Stop buttons behave
      initializeRecognition();
      void initializeEngine();
      return;
    }
    initializeRecognition();
    void initializeEngine();
  }, []); // Empty dependency array to run only once

  // Separate effect for restoring state - only run once on mount
  useEffect(() => {
    // Restore prior conversation state only once
    try {
      const saved = localStorage.getItem('ai-voice-conversation');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.history) && parsed.history.length > 0) {
          log(`Restoring ${parsed.history.length} messages from localStorage`);
          // Clear any existing history first
          sendAssistant({ type: 'CLEAR' });
          // Then restore the saved history
          (parsed.history as ChatMessage[]).forEach((m: ChatMessage, idx: number) => {
            if (m.role === 'user') {
              log(`Restoring user message ${idx + 1}: "${m.content}"`);
              sendAssistant({ type: 'ADD_USER', content: m.content });
            }
            if (m.role === 'assistant') {
              log(`Restoring AI message ${idx + 1}: "${m.content.substring(0, 50)}..."`);
              sendAssistant({ type: 'ADD_ASSISTANT', content: m.content });
            }
          });
        }
        if (typeof parsed?.transcript === 'string') {
          sendAssistant({ type: 'SET_TRANSCRIPT', content: parsed.transcript });
        }
      }
    } catch (e) {
      log(`Failed to restore conversation: ${e}`);
    }

    // Restore voice configuration
    try {
      const savedVoiceConfig = localStorage.getItem('ai-voice-config');
      if (savedVoiceConfig) {
        const parsed = JSON.parse(savedVoiceConfig);
        log(`Restoring voice config: ${parsed.voice?.name || 'default'}`);
        
        // Wait for voices to be available before restoring
        const restoreVoiceConfig = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length === 0) {
            setTimeout(restoreVoiceConfig, 100);
            return;
          }
          
          const restoredVoice = parsed.voice 
            ? voices.find(v => v.name === parsed.voice.name && v.lang === parsed.voice.lang)
            : null;
          
          setVoiceConfig({
            rate: parsed.rate || 1.0,
            pitch: parsed.pitch || 1.0,
            volume: parsed.volume || 1.0,
            voice: restoredVoice,
            language: parsed.language || navigator.language || 'en-US'
          });
        };
        
        restoreVoiceConfig();
      }
    } catch (e) {
      log(`Failed to restore voice config: ${e}`);
    }
  }, []); // Empty dependency array to run only once

  // FSM handles state management automatically - no manual sync needed

  // Persist conversation state
  useEffect(() => {
    try {
      const payload = JSON.stringify({ history: conversationHistory, transcript, response });
      localStorage.setItem('ai-voice-conversation', payload);
    } catch { /* ignore */ }
  }, [conversationHistory.length, transcript, response]);

  // Save voice configuration to localStorage
  useEffect(() => {
    try {
      const voiceConfigToSave = {
        ...voiceConfig,
        voice: voiceConfig.voice ? {
          name: voiceConfig.voice.name,
          lang: voiceConfig.voice.lang
        } : null
      };
      localStorage.setItem('ai-voice-config', JSON.stringify(voiceConfigToSave));
    } catch { /* ignore */ }
  }, [voiceConfig]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    try { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch { /* ignore */ }
  }, [conversationHistory.length]);

  // Auto-scroll transcript to bottom when transcript changes
  useEffect(() => {
    try { 
      transcriptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); 
    } catch { /* ignore */ }
  }, [transcript]);

  // Voices may load asynchronously
  useEffect(() => {
    if ((window.speechSynthesis as any).onvoiceschanged !== undefined) {
      (window.speechSynthesis as any).onvoiceschanged = () => {
        // eslint-disable-next-line no-console
        console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
      };
    }
  }, []);



  // Configuration UI - rendered as overlay to keep conversation logic mounted
  const configurationOverlay = isConfiguring ? (
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: window.innerWidth <= 768 ? '0.5rem' : '1rem',
        maxHeight: '100vh',
        overflowY: 'auto'
      }}>
        <Card 
          withBorder={false} 
          radius={window.innerWidth <= 768 ? "lg" : "xl"} 
          p={window.innerWidth <= 768 ? "md" : "xl"} 
          shadow="xs" 
          style={getCardStyle}
        >
        <Stack gap="xl">
          <Stack gap="sm" ta="center">
            <Title order={1} size="h2" fw={600} c={isDark ? "gray.1" : "gray.8"}>Assistant Configuration</Title>
            <Text size="sm" c={isDark ? "gray.4" : "gray.6"}>
              Customize your AI assistant settings
            </Text>
          </Stack>

          <Stack gap="lg">
            {/* System Prompt */}
            <Stack gap="sm">
              <Text fw={600} c={isDark ? "gray.3" : "gray.7"}>System Prompt</Text>
              <Textarea
                placeholder="You are a helpful AI assistant..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.currentTarget.value)}
                radius="lg"
                size="md"
                autosize
                minRows={2}
                maxRows={4}
                styles={{
                  input: {
                    backgroundColor: isDark ? 'rgba(37, 38, 43, 0.8)' : 'rgba(248, 249, 250, 0.8)',
                    border: isDark ? '1px solid rgba(55, 58, 64, 0.8)' : '1px solid rgba(233, 236, 239, 0.8)',
                    fontSize: '14px',
                    color: isDark ? 'var(--mantine-color-gray-1)' : 'var(--mantine-color-gray-8)'
                  }
                }}
              />
              <Text size="xs" c="gray.5">
                This defines how the AI will behave and respond to your messages
              </Text>
            </Stack>

            {/* Voice Settings */}
            <Stack gap="sm">
              <Text fw={600} c={isDark ? "gray.3" : "gray.7"}>Voice Settings</Text>
              
              {/* Voice Selection */}
              <Select
                label="Voice"
                placeholder="Select a voice..."
                value={voiceConfig.voice ? `${voiceConfig.voice.name}|${voiceConfig.voice.lang}` : ''}
                onChange={(value) => {
                  if (value) {
                    const [name, lang] = value.split('|');
                    const selectedVoice = availableVoices.find(v => v.name === name && v.lang === lang);
                    if (selectedVoice) {
                      setVoiceConfig(prev => ({ ...prev, voice: selectedVoice }));
                    }
                  }
                }}
                data={availableVoices
                  .filter((voice, index, arr) => 
                    arr.findIndex(v => v.name === voice.name && v.lang === voice.lang) === index
                  )
                  .map(voice => ({
                    value: `${voice.name}|${voice.lang}`,
                    label: `${voice.name} (${voice.lang})`
                  }))}
                radius="lg"
                size="sm"
                styles={{
                  input: {
                    backgroundColor: isDark ? 'rgba(37, 38, 43, 0.8)' : 'rgba(248, 249, 250, 0.8)',
                    border: isDark ? '1px solid rgba(55, 58, 64, 0.8)' : '1px solid rgba(233, 236, 239, 0.8)',
                    fontSize: '14px',
                    color: isDark ? 'var(--mantine-color-gray-1)' : 'var(--mantine-color-gray-8)'
                  },
                  dropdown: {
                    backgroundColor: isDark ? 'rgba(37, 38, 43, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: isDark ? '1px solid rgba(55, 58, 64, 0.8)' : '1px solid rgba(233, 236, 239, 0.8)'
                  },

                  label: {
                    color: isDark ? 'var(--mantine-color-gray-3)' : 'var(--mantine-color-gray-7)'
                  }
                }}
              />

              {/* Language Selection */}
              <Select
                label="Language"
                placeholder="Select language..."
                value={voiceConfig.language}
                onChange={(value) => {
                  if (value) {
                    setVoiceConfig(prev => ({ ...prev, language: value }));
                  }
                }}
                data={[
                  { value: 'en-US', label: 'English (US)' },
                  { value: 'en-GB', label: 'English (UK)' },
                  { value: 'es-ES', label: 'Spanish (Spain)' },
                  { value: 'es-MX', label: 'Spanish (Mexico)' },
                  { value: 'fr-FR', label: 'French (France)' },
                  { value: 'de-DE', label: 'German (Germany)' },
                  { value: 'it-IT', label: 'Italian (Italy)' },
                  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
                  { value: 'ja-JP', label: 'Japanese' },
                  { value: 'ko-KR', label: 'Korean' },
                  { value: 'zh-CN', label: 'Chinese (Simplified)' },
                  { value: 'ru-RU', label: 'Russian' },
                  { value: 'ar-SA', label: 'Arabic' },
                  { value: 'hi-IN', label: 'Hindi' }
                ]}
                radius="lg"
                size="sm"
                styles={{
                  input: {
                    backgroundColor: isDark ? 'rgba(37, 38, 43, 0.8)' : 'rgba(248, 249, 250, 0.8)',
                    border: isDark ? '1px solid rgba(55, 58, 64, 0.8)' : '1px solid rgba(233, 236, 239, 0.8)',
                    fontSize: '14px',
                    color: isDark ? 'var(--mantine-color-gray-1)' : 'var(--mantine-color-gray-8)'
                  },
                  dropdown: {
                    backgroundColor: isDark ? 'rgba(37, 38, 43, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: isDark ? '1px solid rgba(55, 58, 64, 0.8)' : '1px solid rgba(233, 236, 239, 0.8)'
                  },

                  label: {
                    color: isDark ? 'var(--mantine-color-gray-3)' : 'var(--mantine-color-gray-7)'
                  }
                }}
              />

              {/* Voice Controls */}
              <Group grow>
                <Stack gap="xs">
                  <Text size="sm" c={isDark ? "gray.4" : "gray.6"}>
                    Speed: {voiceConfig.rate.toFixed(1)}x
                  </Text>
                  <Slider
                    value={voiceConfig.rate}
                    onChange={(value) => setVoiceConfig(prev => ({ ...prev, rate: value }))}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    marks={[
                      { value: 0.5, label: '0.5x' },
                      { value: 1.0, label: '1x' },
                      { value: 2.0, label: '2x' }
                    ]}
                    size="sm"
                    styles={{
                      track: {
                        backgroundColor: isDark ? 'rgba(55, 58, 64, 0.8)' : 'rgba(233, 236, 239, 0.8)'
                      },
                      bar: {
                        backgroundColor: isDark ? 'var(--mantine-color-blue-4)' : 'var(--mantine-color-blue-6)'
                      },
                      thumb: {
                        backgroundColor: isDark ? 'var(--mantine-color-blue-4)' : 'var(--mantine-color-blue-6)',
                        border: isDark ? '2px solid rgba(37, 38, 43, 0.95)' : '2px solid rgba(255, 255, 255, 0.95)'
                      },
                      markLabel: {
                        color: isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'
                      }
                    }}
                  />
                </Stack>
                <Stack gap="xs">
                  <Text size="sm" c={isDark ? "gray.4" : "gray.6"}>
                    Pitch: {voiceConfig.pitch.toFixed(1)}
                  </Text>
                  <Slider
                    value={voiceConfig.pitch}
                    onChange={(value) => setVoiceConfig(prev => ({ ...prev, pitch: value }))}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    marks={[
                      { value: 0.5, label: '0.5' },
                      { value: 1.0, label: '1' },
                      { value: 2.0, label: '2' }
                    ]}
                    size="sm"
                    styles={{
                      track: {
                        backgroundColor: isDark ? 'rgba(55, 58, 64, 0.8)' : 'rgba(233, 236, 239, 0.8)'
                      },
                      bar: {
                        backgroundColor: isDark ? 'var(--mantine-color-violet-4)' : 'var(--mantine-color-violet-6)'
                      },
                      thumb: {
                        backgroundColor: isDark ? 'var(--mantine-color-violet-4)' : 'var(--mantine-color-violet-6)',
                        border: isDark ? '2px solid rgba(37, 38, 43, 0.95)' : '2px solid rgba(255, 255, 255, 0.95)'
                      },
                      markLabel: {
                        color: isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'
                      }
                    }}
                  />
                </Stack>
              </Group>

              {/* Test Voice Button */}
              <Button
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  const testText = "Hello! This is how I will sound with your current voice settings.";
                  
                  // Create a direct test utterance to ensure settings are applied
                  const testVoice = () => {
                    try {
                      window.speechSynthesis.cancel();
                      
                      // Ensure voices are loaded
                      const voices = window.speechSynthesis.getVoices();
                      if (voices.length === 0) {
                        // Wait for voices to load
                        setTimeout(testVoice, 100);
                        return;
                      }
                      
                      const utterance = new SpeechSynthesisUtterance(testText);
                      
                      // Explicitly apply current voice configuration
                      if (voiceConfig.voice) {
                        // Make sure the voice is still available
                        const currentVoice = voices.find(v => v.name === voiceConfig.voice?.name);
                        if (currentVoice) {
                          utterance.voice = currentVoice;
                        }
                      }
                      utterance.rate = voiceConfig.rate;
                      utterance.pitch = voiceConfig.pitch;
                      utterance.volume = voiceConfig.volume;
                      utterance.lang = voiceConfig.language;
                      
                      console.log('Testing voice with config:', {
                        voice: utterance.voice?.name,
                        rate: utterance.rate,
                        pitch: utterance.pitch,
                        volume: utterance.volume,
                        language: utterance.lang,
                        availableVoices: voices.length
                      });
                      
                      window.speechSynthesis.speak(utterance);
                    } catch (error) {
                      console.error('Voice test error:', error);
                      // Fallback to regular speakResponse
                      speakResponse(testText);
                    }
                  };
                  
                  testVoice();
                }}
                variant="light"
                radius="lg"
                size="sm"
              >
                🔊 Test Voice
              </Button>

              <Text size="xs" c="gray.5">
                Voice settings will be applied to all AI responses and saved for future sessions
              </Text>
            </Stack>

            {/* Memory Management Settings */}
            <Stack gap="sm">
              <Text fw={600} c={isDark ? "gray.3" : "gray.7"}>Memory Management</Text>
              
              {/* Enable Auto Summary Toggle */}
              <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" c={isDark ? "gray.2" : "gray.8"}>Auto-summarize conversations</Text>
                  <Text size="xs" c="gray.5">
                    Automatically summarize old messages to maintain context while keeping conversations efficient
                  </Text>
                </Stack>
                <Button
                  variant={memoryConfig.enableAutoSummary ? "filled" : "light"}
                  size="xs"
                  onClick={() => setMemoryConfig(prev => ({ ...prev, enableAutoSummary: !prev.enableAutoSummary }))}
                >
                  {memoryConfig.enableAutoSummary ? 'ON' : 'OFF'}
                </Button>
              </Group>

              {memoryConfig.enableAutoSummary && (
                <>
                  {/* Max Messages Slider */}
                  <Stack gap="xs">
                    <Text size="sm" c={isDark ? "gray.4" : "gray.6"}>
                      Max messages before summarization: {memoryConfig.summaryTrigger}
                    </Text>
                    <Slider
                      value={memoryConfig.summaryTrigger}
                      onChange={(value) => setMemoryConfig(prev => ({ 
                        ...prev, 
                        summaryTrigger: value,
                        maxMessages: Math.max(value + 4, prev.maxMessages)
                      }))}
                      min={8}
                      max={30}
                      step={2}
                      marks={[
                        { value: 8, label: '8' },
                        { value: 16, label: '16' },
                        { value: 30, label: '30' }
                      ]}
                      size="sm"
                      styles={{
                        track: {
                          backgroundColor: isDark ? 'rgba(55, 58, 64, 0.8)' : 'rgba(233, 236, 239, 0.8)'
                        },
                        bar: {
                          backgroundColor: isDark ? 'var(--mantine-color-teal-4)' : 'var(--mantine-color-teal-6)'
                        },
                        thumb: {
                          backgroundColor: isDark ? 'var(--mantine-color-teal-4)' : 'var(--mantine-color-teal-6)',
                          border: isDark ? '2px solid rgba(37, 38, 43, 0.95)' : '2px solid rgba(255, 255, 255, 0.95)'
                        },
                        markLabel: {
                          color: isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'
                        }
                      }}
                    />
                  </Stack>

                  {/* Recent Messages Slider */}
                  <Stack gap="xs">
                    <Text size="sm" c={isDark ? "gray.4" : "gray.6"}>
                      Keep recent messages: {memoryConfig.keepRecentMessages}
                    </Text>
                    <Slider
                      value={memoryConfig.keepRecentMessages}
                      onChange={(value) => setMemoryConfig(prev => ({ ...prev, keepRecentMessages: value }))}
                      min={4}
                      max={12}
                      step={1}
                      marks={[
                        { value: 4, label: '4' },
                        { value: 6, label: '6' },
                        { value: 12, label: '12' }
                      ]}
                      size="sm"
                      styles={{
                        track: {
                          backgroundColor: isDark ? 'rgba(55, 58, 64, 0.8)' : 'rgba(233, 236, 239, 0.8)'
                        },
                        bar: {
                          backgroundColor: isDark ? 'var(--mantine-color-green-4)' : 'var(--mantine-color-green-6)'
                        },
                        thumb: {
                          backgroundColor: isDark ? 'var(--mantine-color-green-4)' : 'var(--mantine-color-green-6)',
                          border: isDark ? '2px solid rgba(37, 38, 43, 0.95)' : '2px solid rgba(255, 255, 255, 0.95)'
                        },
                        markLabel: {
                          color: isDark ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-gray-6)'
                        }
                      }}
                    />
                  </Stack>
                </>
              )}

              {conversationSummary && (
                <Card 
                  withBorder={false}
                  radius="lg" 
                  p="sm"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    border: isDark ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)'
                  }}
                >
                  <Text size="xs" c={isDark ? "green.4" : "green.7"} fw={500} mb="xs">
                    Current Memory Summary:
                  </Text>
                  <Text size="xs" c={isDark ? "green.3" : "green.8"} style={{ lineHeight: 1.4 }}>
                    {conversationSummary.length > 150 
                      ? `${conversationSummary.substring(0, 150)}...` 
                      : conversationSummary}
                  </Text>
                </Card>
              )}

              <Text size="xs" c="gray.5">
                Memory management helps maintain context while preventing token limits and improving performance
              </Text>
            </Stack>

            {/* Model Selection Settings */}
            <Stack gap="sm">
              <Text fw={600} c={isDark ? "gray.3" : "gray.7"}>Model Selection</Text>
              
              <Stack gap="xs">
                <Text size="sm" c={isDark ? "gray.2" : "gray.8"}>AI Model</Text>
                <Select
                  value={modelConfig.selectedModel}
                  onChange={(value) => {
                    if (value) {
                      changeModel(value);
                    }
                  }}
                  data={modelConfig.availableModels.map(model => ({
                    value: model.id,
                    label: `${model.name} - ${model.size}`
                  }))}
                  styles={{
                    input: {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      color: isDark ? '#fff' : '#000',
                    },
                    dropdown: {
                      backgroundColor: isDark ? '#2c2e33' : '#fff',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    },
                    label: {
                      color: isDark ? '#fff' : '#000',
                    }
                  }}
                />
                <Text size="xs" c="gray.5">
                  Changing models will download the new model (~1-4GB). The current conversation will be preserved.
                </Text>
              </Stack>
            </Stack>

            <Card 
              withBorder={false}
              radius="lg" 
              p="md"
              style={{ 
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 246, 255, 0.4)',
                border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(191, 219, 254, 0.3)'
              }}
            >
              <Stack gap="xs">
                <Text fw={600} c={isDark ? "blue.4" : "blue.7"} size="sm">About Conversation Mode</Text>
                <Text size="sm" c={isDark ? "blue.3" : "blue.8"} style={{ lineHeight: 1.5 }}>
                  When enabled, the assistant will automatically listen for your next message after responding, creating a natural back-and-forth conversation flow.
                </Text>
              </Stack>
            </Card>
          </Stack>

          <Group justify="center" mt="lg">
            <Button 
              variant="light" 
              radius="xl"
              size="md"
              onClick={() => setIsConfiguring(false)}
              c="gray.6"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsConfiguring(false);
                // Apply system prompt here if needed
              }}
              disabled={!engine || isSwitchingModel}
              radius="xl"
              size="md"
              variant="gradient"
              gradient={{ from: 'blue.5', to: 'blue.7' }}
            >
              Save & Continue
            </Button>
          </Group>
        </Stack>
        </Card>
      </div>
  ) : null;

  // Main UI
  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: window.innerWidth <= 768 ? '0.5rem' : '1rem',
      position: 'relative'
    }}>
      {/* Configuration overlay */}
      {configurationOverlay && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
          padding: window.innerWidth <= 768 ? '0.5rem' : '1rem',
          overflow: 'auto'
        }}>
          {configurationOverlay}
        </div>
      )}
      
      <Card 
        withBorder={false} 
        radius={window.innerWidth <= 768 ? "lg" : "xl"} 
        p={window.innerWidth <= 768 ? "md" : "xl"} 
        shadow="xs" 
        style={getCardStyle}
      >
        <Stack gap={window.innerWidth <= 768 ? "md" : "xl"}>
        <Stack gap="sm" ta="center">
          <Title order={1} size="h2" fw={600} c={isDark ? "gray.1" : "gray.8"}>AI Voice Assistant</Title>
          
          {/* Status indicator - minimal and clean */}
          <Card 
            withBorder={false} 
            radius="xl" 
            p="sm" 
            style={getStatusStyle(statusType)}
          >
            <Text 
              ta="center" 
              c={statusType === 'error' ? 'red.7' : statusType === 'ready' ? 'teal.7' : 'blue.7'} 
              fw={500} 
              size="sm"
            >
              {status}
            </Text>
            {statusType === 'loading' && (
              <Progress 
                value={progress} 
                size="xs" 
                radius="xl" 
                mt="xs"
                color="blue"
              />
            )}
          </Card>
        </Stack>

        {/* Essential control buttons - only show when needed */}
        {(isSpeaking || isListening) && (
          <Group justify="center" gap="sm">
            {isSpeaking && (
              <Button 
                variant="light"
                color="orange"
                radius="xl"
                size="sm"
                onClick={stopSpeech}
                leftSection="🔇"
              >
                Stop Speaking
              </Button>
            )}
            {isListening && (
              <Button 
                variant="light"
                color="yellow"
                radius="xl"
                size="sm"
                onClick={() => {
                  log('Manual reset: stopping recognition and clearing state');
                  try { recognitionRef.current?.stop(); } catch (e) { void e; }
                  sendVoice({ type: 'RESET' });
                  clearAutoListenTimeout();
                }}
                leftSection="🔄"
              >
                Stop Listening
              </Button>
            )}
          </Group>
        )}

        {/* Chat History - elegant and spacious */}
        <Card 
          withBorder={false} 
          radius="xl" 
          p="lg" 
          style={{ 
            maxHeight: 400, 
            overflowY: 'auto',
            ...getChatStyle
          }}
        >
          <Text fw={600} size="sm" c={isDark ? "gray.3" : "gray.7"} mb="lg">Conversation</Text>
          <Stack gap="md">
            {conversationHistory.length === 0 ? (
              <Stack align="center" py="xl">
                <Text c="gray.5" ta="center" size="sm" fs="italic">
                  Your conversation will appear here...
                </Text>
              </Stack>
            ) : (
              conversationHistory.map((m, idx) => (
                <Stack 
                  key={idx}
                  gap="xs"
                  style={{ 
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  <Text size="xs" c={isDark ? "gray.4" : "gray.6"} fw={500} ml={m.role === 'user' ? 'auto' : 0}>
                    {m.role === 'user' ? 'You' : 'AI Assistant'}
                  </Text>
                  <Card 
                    p="md" 
                    radius="lg" 
                    withBorder={false}
                    style={{ 
                      backgroundColor: m.role === 'user' 
                        ? (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(74, 144, 226, 0.1)')
                        : (isDark ? 'rgba(55, 58, 64, 0.9)' : 'rgba(255, 255, 255, 0.9)'),
                      border: `1px solid ${m.role === 'user' 
                        ? (isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(74, 144, 226, 0.2)')
                        : (isDark ? 'rgba(55, 58, 64, 0.8)' : 'rgba(233, 236, 239, 0.8)')}`,
                      boxShadow: m.role === 'assistant' 
                        ? (isDark ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.04)')
                        : 'none'
                    }}
                  >
                    <Text 
                      style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }} 
                      size="sm"
                      c={m.role === 'user' 
                        ? (isDark ? 'blue.3' : 'blue.8')
                        : (isDark ? 'gray.1' : 'gray.8')
                      }
                    >
                      {m.content}
                    </Text>
                  </Card>
                </Stack>
              ))
            )}
            <div ref={chatEndRef} />
          </Stack>
        </Card>

        {/* Modern LLM-style input section */}
        <Stack gap="sm">
          {/* Main input area - ChatGPT style */}
          <Card 
            withBorder={false}
            radius="xl" 
            p="md"
            style={{
              ...getInputStyle,
              position: 'relative'
            }}
          >
            <Group align="flex-end" gap="sm">
              <Textarea
                style={{ flex: 1 }}
                placeholder="Message AI Voice Assistant..."
                value={manualInput}
                onChange={(e) => setManualInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && manualInput.trim() && !isProcessing) {
                    e.preventDefault();
                    const t = manualInput.trim();
                    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
                    sendVoice({ type: 'STOP_EVERYTHING' });
                    sendAssistant({ type: 'SET_TRANSCRIPT', content: `You said: "${t}"` });
                    void processUserInput(t);
                    setManualInput('');
                  }
                }}
                autosize
                minRows={1}
                maxRows={6}
                radius="lg"
                styles={{
                  input: {
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    color: isDark ? 'var(--mantine-color-gray-1)' : 'var(--mantine-color-gray-8)',
                    resize: 'none',
                    '&:focus': {
                      outline: 'none',
                      boxShadow: 'none'
                    },
                    '&::placeholder': {
                      color: isDark ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-gray-5)'
                    }
                  }
                }}
              />
              
              {/* Send button - only show when there's text */}
              {manualInput.trim() && (
                <Button
                  onClick={() => {
                    if (manualInput.trim() && !isProcessing) {
                      const t = manualInput.trim();
                      try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
                      sendVoice({ type: 'STOP_EVERYTHING' });
                      sendAssistant({ type: 'SET_TRANSCRIPT', content: `You said: "${t}"` });
                      void processUserInput(t);
                      setManualInput('');
                    }
                  }}
                  disabled={!engine || isProcessing}
                  variant="filled"
                  color="blue"
                  radius="lg"
                  size="sm"
                  style={{ minWidth: 60 }}
                >
                  Send
                </Button>
              )}
            </Group>
          </Card>

          {/* Control row */}
          <Group justify="space-between" align="center" px="md">
            <Group gap="md">
              <Button 
                variant="subtle" 
                size="xs" 
                radius="lg"
                onClick={() => setIsConfiguring(true)}
                c={isDark ? "gray.4" : "gray.6"}
                leftSection="⚙️"
              >
                Settings
              </Button>
              <Button 
                variant="subtle" 
                size="xs" 
                radius="lg"
                color="red" 
                onClick={clearHistory}
                c={isDark ? "red.4" : "red.6"}
                leftSection="🗑️"
              >
                Clear
              </Button>
              
              <Button
                onClick={() => (conversationMode ? setConversationMode(false) : startConversation())}
                disabled={!engine}
                variant={conversationMode ? "filled" : "light"}
                color={conversationMode ? "teal" : "gray"}
                radius="lg"
                size="xs"
              >
                {conversationMode ? 'Stop Conversation' : 'Start Conversation'}
              </Button>
            </Group>
            
            <Text size="xs" c={isDark ? "gray.4" : "gray.6"} fw={500}>
              {conversationMode ? '🔄 Conversation mode' : '💬 Single message'} • Shift+Enter for new line
            </Text>
          </Group>
          {/* Voice transcript - elegant bottom section */}
          <Card 
            ref={transcriptRef}
            withBorder={false}
            radius="xl" 
            p="md"
            style={getTranscriptStyle}
          >
            <Stack gap="xs" align="center">
              <Text fw={500} size="xs" c={isDark ? "blue.4" : "blue.6"} tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                Voice Input
              </Text>
              <Text 
                c={isDark ? "blue.2" : "blue.8"}
                fs="italic" 
                ta="center"
                size="sm"
                style={{ lineHeight: 1.4 }}
              >
                {transcript || 'Click the microphone to start speaking...'}
              </Text>
            </Stack>
          </Card>
        </Stack>



        <Text size="xs" c="gray.4" ta="center" style={{ marginTop: '1rem' }}>
          Powered by WebLLM • Local AI Processing • No Data Sent to Servers
        </Text>
      </Stack>
      </Card>
    </div>
  );
};

export default VoiceAssistant;


