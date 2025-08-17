import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Group, Progress, Stack, Text, Title, TextInput } from '@mantine/core';
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
  
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [/* micPermission */, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  const recognitionRef = useRef<any | null>(null);
  const autoListenTimeoutRef = useRef<number | null>(null);
  const processUserInputRef = useRef<(text: string) => void>(() => {});
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const log = useCallback((message: string) => {
    const entry = `[${new Date().toLocaleTimeString()}] ${message}`;
    setDebugLog(prev => {
      const next = [...prev, entry];
      return next.slice(-500);
    });
    // eslint-disable-next-line no-console
    console.log(entry);
  }, []);

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

  const stopEverything = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch (e) { void e; }
    window.speechSynthesis.cancel();
    clearAutoListenTimeout();
    sendVoice({ type: 'STOP_EVERYTHING' });
    log('Stopped all voice activities');
  }, [clearAutoListenTimeout, log, sendVoice]);

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
    recognition.lang = 'en-US';

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
        updateStatus('No speech detected. Please try again.', 'error');
        if (conversationMode) scheduleAutoListen(2000);
      } else if (err === 'not-allowed' || err === 'service-not-allowed') {
        updateStatus('Microphone permission denied. Please allow mic access.', 'error');
        setMicPermission('denied');
      } else if (err === 'aborted') {
        // user stopped; no status change
      } else if (err === 'network') {
        updateStatus('Network error with speech service. Try again.', 'error');
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

  const initializeEngine = useCallback(async () => {
    if (engine || isEngineInitializing) {
      log('Engine already initialized or initializing, skipping');
      return;
    }
    
    setIsEngineInitializing(true);
    try {
      updateStatus('Loading AI engine...', 'loading');
      log('Getting shared WebLLM engine');
      const loaded = await getSharedEngine((p: any) => {
        const percent = Math.round((p?.progress ?? 0) * 100);
        setProgress(percent);
        updateStatus(`Downloading model... ${percent}%`, 'loading');
      });
      setEngine(loaded);
      setProgress(100);
      updateStatus('AI Assistant ready! Click the microphone to start.', 'ready');
    } catch (e: any) {
      log(`WebLLM initialization failed: ${e?.message ?? e}`);
      // Fallback mock engine
      const mock = {
        chat: {
          completions: {
            create: async (options: any) => {
              await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));
              const userMessage = (options?.messages?.[options.messages.length - 1]?.content ?? '').toLowerCase();
              const replies = {
                greeting: [
                  "Hello! I'm a demo voice assistant.",
                  'Hi there! How can I help today?',
                ],
                default: [
                  'This is a mock response demonstrating the voice interface.',
                  'Thanks for testing! This shows speech-to-text and text-to-speech working together.',
                ]
              };
              const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
              const content = userMessage.includes('hello') || userMessage.includes('hi') ? pick(replies.greeting) : pick(replies.default);
              return { choices: [{ message: { content } }] };
            }
          }
        }
      };
      setEngine(mock);
      updateStatus('Demo AI ready! (Using mock responses)', 'ready');
      sendAssistant({ type: 'ADD_ASSISTANT', content: '🎭 Demo Mode: Using mock AI responses since WebLLM failed to load.' });
    } finally {
      setIsEngineInitializing(false);
    }
  }, [engine, isEngineInitializing, log, updateStatus]);

  const speakResponse = useCallback((text: string) => {
    try { 
      window.speechSynthesis.cancel(); 
      // FSM will handle state when STOP_EVERYTHING is sent
    } catch (e) { void e; }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const voice = preferredVoice(voices);
    if (voice) utterance.voice = voice;
    
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
    if (!engine) { log('processUserInput skipped: engine not ready'); return; }
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
    // Build messages for API call
    const nextHistory: ChatMessage[] = [...conversationHistory, { role: 'user', content: text }];
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful AI assistant. Keep responses concise and conversational for voice.' },
        ...nextHistory
      ];
      const reply: any = await withTimeout(engine.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 200
      }), 45000);
      const content: string = reply?.choices?.[0]?.message?.content ?? 'Sorry, I had trouble responding.';
      sendVoice({ type: 'LLM_RESPONSE', response: content });
      sendAssistant({ type: 'ADD_ASSISTANT', content });
      if (conversationMode) {
        updateStatus('Speaking... (will auto-listen when done)', 'loading');
      } else {
        updateStatus('Ready for next question', 'ready');
      }
      speakResponse(content);
    } catch (e: any) {
      const msg = e?.message || String(e) || 'Unknown error';
      log(`AI processing error: ${msg}`);
      sendVoice({ type: 'LLM_ERROR', error: msg });
      sendAssistant({ type: 'ADD_ASSISTANT', content: `Sorry, I encountered an error. (${msg})` });
      updateStatus(`Error processing request: ${msg}`, 'error');
      if (conversationMode) scheduleAutoListen(2000);
    } finally {
      // FSM handles processing state automatically
      // Don't schedule auto-listen here - let TTS onend handle it
      // This prevents multiple conflicting scheduleAutoListen calls
    }
  }, [conversationHistory, conversationMode, engine, isProcessing, log, scheduleAutoListen, speakResponse, updateStatus, sendVoice]);

  useEffect(() => {
    processUserInputRef.current = (t: string) => { void processUserInput(t); };
  }, [processUserInput]);

  const ensureMicPermission = useCallback(async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) return true;
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      return true;
    } catch {
      setMicPermission('denied');
      updateStatus('Microphone permission denied. Please allow mic access.', 'error');
      return false;
    }
  }, [updateStatus]);

  const onMicClick = useCallback(async () => {
    if (!engine || isProcessing) return;
    if (conversationMode) {
      // Stop conversation mode
      setConversationMode(false);
      stopEverything();
      updateStatus('Conversation mode stopped', 'ready');
      return;
    }
    // Interrupt TTS immediately when user initiates talking
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    const ok = await ensureMicPermission();
    if (!ok) return;
    
    if (isListening) {
      // Stop listening
      try { recognitionRef.current?.stop(); } catch (e) { void e; }
      sendVoice({ type: 'STOP_EVERYTHING' });
    } else {
      // Start listening
      sendVoice({ type: 'START_LISTENING' });
      try {
        recognitionRef.current?.start();
      } catch {
        // if already started, stop and retry
        try { recognitionRef.current?.stop(); } catch (err) { void err; }
        window.setTimeout(() => {
          try { recognitionRef.current?.start(); } catch (err2) { void err2; }
        }, 400);
      }
    }
  }, [conversationMode, engine, ensureMicPermission, isListening, isProcessing, stopEverything, updateStatus, sendVoice]);

  const startConversation = useCallback(() => {
    if (!engine) return;
    setConversationMode(true);
    sendVoice({ type: 'START_LISTENING' });
    updateStatus('Conversation mode active - start speaking...', 'ready');
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
    sendAssistant({ type: 'CLEAR' });
    updateStatus('Chat history cleared. Ready for new conversation.', 'ready');
  }, [updateStatus]);

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
  }, []); // Empty dependency array to run only once

  // FSM handles state management automatically - no manual sync needed

  // Persist conversation state
  useEffect(() => {
    try {
      const payload = JSON.stringify({ history: conversationHistory, transcript, response });
      localStorage.setItem('ai-voice-conversation', payload);
    } catch { /* ignore */ }
  }, [conversationHistory.length, transcript, response]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    try { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch { /* ignore */ }
  }, [conversationHistory.length]);

  // Voices may load asynchronously
  useEffect(() => {
    if ((window.speechSynthesis as any).onvoiceschanged !== undefined) {
      (window.speechSynthesis as any).onvoiceschanged = () => {
        // eslint-disable-next-line no-console
        console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
      };
    }
  }, []);

  const micButtonLabel = useMemo(() => {
    if (!engine) return '⏳';
    if (conversationMode) return '⏹️';
    if (isListening) return '🔴';
    if (isSpeaking) return '🔊';
    return '🎤';
  }, [conversationMode, engine, isListening, isSpeaking]);

  return (
    <Card withBorder radius="lg" p="lg" shadow="sm">
      <Stack gap="md">
        <Title order={2} ta="center">AI Voice Assistant</Title>
        <Text ta="center" c={statusType === 'error' ? 'red' : statusType === 'ready' ? 'teal' : 'yellow'}>
          {status}
        </Text>
        {statusType === 'loading' && (
          <Progress value={progress} striped animated>
          </Progress>
        )}

        <Box ta="center">
          <Button
            onClick={onMicClick}
            disabled={!engine || isProcessing}
            variant="gradient"
            gradient={{ from: conversationMode ? 'teal' : isListening ? 'cyan' : isSpeaking ? 'indigo' : 'red', to: 'pink' }}
            radius={999}
            styles={{ root: { width: 120, height: 120, borderRadius: 9999, fontSize: 36 } }}
          >
            {micButtonLabel}
          </Button>
        </Box>

        <Group justify="center">
          <Button variant="light" onClick={() => (conversationMode ? setConversationMode(false) : startConversation())}>
            {conversationMode ? 'Stop Conversation' : 'Start Conversation'}
          </Button>
          <Button 
            variant={isSpeaking ? "filled" : "light"} 
            color={isSpeaking ? "orange" : undefined}
            onClick={stopSpeech}
            disabled={!isSpeaking}
          >
            {isSpeaking ? "🔇 Stop Speaking" : "Stop Speech"}
          </Button>
          {isListening && (
            <Button 
              variant="filled" 
              color="yellow"
              onClick={() => {
                log('Manual reset: stopping recognition and clearing state');
                try { recognitionRef.current?.stop(); } catch (e) { void e; }
                sendVoice({ type: 'RESET' });
                clearAutoListenTimeout();
              }}
            >
              🔄 Reset
            </Button>
          )}
          <Button variant="filled" color="red" onClick={clearHistory}>Clear Chat</Button>
        </Group>

        <Group align="flex-end">
          <TextInput
            style={{ flex: 1 }}
            placeholder="Type a message (fallback if mic disabled)"
            value={manualInput}
            onChange={(e) => setManualInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && manualInput.trim() && !isProcessing) {
                const t = manualInput.trim();
                try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
                sendVoice({ type: 'STOP_EVERYTHING' });
                sendAssistant({ type: 'SET_TRANSCRIPT', content: `You said: "${t}"` });
                void processUserInput(t);
                setManualInput('');
              }
            }}
          />
          <Button
            onClick={() => {
              if (!manualInput.trim() || isProcessing) return;
              const t = manualInput.trim();
              try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
              sendVoice({ type: 'STOP_EVERYTHING' });
              sendAssistant({ type: 'SET_TRANSCRIPT', content: `You said: "${t}"` });
              void processUserInput(t);
              setManualInput('');
            }}
            disabled={!engine || isProcessing || !manualInput.trim()}
          >
            Send
          </Button>
        </Group>

        <Card withBorder radius="md" p="md">
          <Text c="dimmed" fs="italic">{transcript}</Text>
        </Card>

        <Card withBorder radius="md" p="md">
          <Text style={{ whiteSpace: 'pre-wrap' }}>{response || 'AI response will appear here...'}</Text>
        </Card>

        <Card withBorder radius="md" p="md" style={{ maxHeight: 300, overflowY: 'auto' }}>
          <Stack gap="sm">
            {conversationHistory.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">Chat will appear here...</Text>
            ) : (
              conversationHistory.map((m, idx) => (
                <Card 
                  key={idx} 
                  p="sm" 
                  radius="md" 
                  style={{ 
                    backgroundColor: m.role === 'user' 
                      ? 'var(--mantine-color-blue-0)' 
                      : 'var(--mantine-color-gray-0)',
                    marginLeft: m.role === 'user' ? '2rem' : '0',
                    marginRight: m.role === 'assistant' ? '2rem' : '0'
                  }}
                >
                  <Text size="xs" c="dimmed" mb="xs" fw={500}>
                    {m.role === 'user' ? '👤 You' : '🤖 AI'}
                  </Text>
                  <Text style={{ whiteSpace: 'pre-wrap' }} size="sm">{m.content}</Text>
                </Card>
              ))
            )}
            <div ref={chatEndRef} />
          </Stack>
        </Card>

        <Box ta="center">
          <Button variant="subtle" size="xs" onClick={() => setShowDebug(v => !v)}>
            {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
          </Button>
        </Box>
        {showDebug && (
          <>
            <Card withBorder radius="md" p="md" style={{ maxHeight: 220, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
              <pre style={{ margin: 0 }}>{debugLog.join('\n')}</pre>
            </Card>
            <Card withBorder radius="md" p="md" bg="gray.0">
              <Text size="sm" fw={500} mb="xs">🔧 Voice State Machine (FSM Demo)</Text>
              <Text size="xs" c="dimmed">Current State: <Text span c="blue" fw={600}>{String(voiceState.value)}</Text></Text>
              <Text size="xs" c="dimmed">Context: {JSON.stringify(voiceState.context, null, 2)}</Text>
              <Group mt="xs">
                <Button size="xs" onClick={() => sendVoice({ type: 'START_LISTENING' })}>FSM: Start Listening</Button>
                <Button size="xs" onClick={() => sendVoice({ type: 'STOP_EVERYTHING' })}>FSM: Stop All</Button>
                <Button size="xs" onClick={() => sendVoice({ type: 'RESET' })}>FSM: Reset</Button>
              </Group>
            </Card>
          </>
        )}

        <Text size="sm" c="dimmed" ta="center">
          This demo uses WebLLM for local AI inference and the Web Speech API for voice recognition/synthesis. First load may take a few minutes.
        </Text>
      </Stack>
    </Card>
  );
};

export default VoiceAssistant;


