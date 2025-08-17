import { createMachine, assign } from 'xstate';

// Voice Assistant States
export type VoiceState = 
  | 'idle'           // Ready to start listening
  | 'listening'      // User is speaking
  | 'processing'     // LLM is thinking
  | 'speaking'       // AI is talking
  | 'error';         // Error state

// Voice Assistant Events
export type VoiceEvent = 
  | { type: 'START_LISTENING' }
  | { type: 'SPEECH_DETECTED'; transcript: string }
  | { type: 'SPEECH_ERROR'; error: string }
  | { type: 'START_PROCESSING' }
  | { type: 'LLM_RESPONSE'; response: string }
  | { type: 'LLM_ERROR'; error: string }
  | { type: 'START_SPEAKING' }
  | { type: 'SPEECH_ENDED' }
  | { type: 'STOP_EVERYTHING' }
  | { type: 'RESET' };

// Context
export interface VoiceContext {
  transcript: string;
  response: string;
  error: string | null;
  conversationMode: boolean;
}

export const voiceStateMachine = createMachine({
  id: 'voiceAssistant',
  initial: 'idle',
  context: {
    transcript: '',
    response: '',
    error: null,
    conversationMode: false,
  } as VoiceContext,
  states: {
    idle: {
      entry: 'clearError',
      on: {
        START_LISTENING: 'listening',
        STOP_EVERYTHING: 'idle',
        RESET: 'idle'
      }
    },
    
    listening: {
      entry: 'startSpeechRecognition',
      on: {
        SPEECH_DETECTED: {
          target: 'processing',
          actions: 'setTranscript'
        },
        SPEECH_ERROR: {
          target: 'error',
          actions: 'setError'
        },
        STOP_EVERYTHING: 'idle',
        RESET: 'idle'
      },
      exit: 'stopSpeechRecognition'
    },
    
    processing: {
      entry: 'startLLMProcessing',
      on: {
        LLM_RESPONSE: {
          target: 'speaking',
          actions: 'setResponse'
        },
        LLM_ERROR: {
          target: 'error',
          actions: 'setError'
        },
        STOP_EVERYTHING: 'idle',
        RESET: 'idle'
      }
    },
    
    speaking: {
      entry: 'startSpeechSynthesis',
      on: {
        SPEECH_ENDED: [
          {
            target: 'listening',
            guard: 'isConversationMode'
          },
          {
            target: 'idle'
          }
        ],
        STOP_EVERYTHING: 'idle',
        RESET: 'idle',
        START_LISTENING: 'listening' // Allow interruption
      },
      exit: 'stopSpeechSynthesis'
    },
    
    error: {
      on: {
        START_LISTENING: 'listening',
        STOP_EVERYTHING: 'idle',
        RESET: 'idle'
      }
    }
  }
}, {
  actions: {
    clearError: assign({ error: null }),
    setTranscript: assign({ 
      transcript: (_, event: any) => event?.type === 'SPEECH_DETECTED' ? event.transcript || '' : ''
    }),
    setResponse: assign({ 
      response: (_, event: any) => event?.type === 'LLM_RESPONSE' ? event.response || '' : ''
    }),
    setError: assign({ 
      error: (_, event: any) => 
        event?.type === 'SPEECH_ERROR' ? event.error :
        event?.type === 'LLM_ERROR' ? event.error : null
    }),
    startSpeechRecognition: () => {
      console.log('FSM: Starting speech recognition');
      // This will be handled by the component
    },
    stopSpeechRecognition: () => {
      console.log('FSM: Stopping speech recognition');
      // This will be handled by the component
    },
    startLLMProcessing: () => {
      console.log('FSM: Starting LLM processing');
      // This will be handled by the component
    },
    startSpeechSynthesis: () => {
      console.log('FSM: Starting speech synthesis');
      // This will be handled by the component
    },
    stopSpeechSynthesis: () => {
      console.log('FSM: Stopping speech synthesis');
      // This will be handled by the component
    }
  },
  guards: {
    isConversationMode: ({ context }: any) => context.conversationMode
  }
});

// Helper functions to check current state
export const isIdle = (state: any) => state.matches('idle');
export const isListening = (state: any) => state.matches('listening');
export const isProcessing = (state: any) => state.matches('processing');
export const isSpeaking = (state: any) => state.matches('speaking');
export const isError = (state: any) => state.matches('error');

// Helper to get status text
export const getStatusText = (state: any): string => {
  if (isIdle(state)) return 'Ready - Click microphone to start';
  if (isListening(state)) return 'Listening... speak now!';
  if (isProcessing(state)) return 'Processing your request...';
  if (isSpeaking(state)) return 'Speaking... (will auto-listen when done)';
  if (isError(state)) return `Error: ${state.context.error}`;
  return 'Unknown state';
};

// Helper to get status type
export const getStatusType = (state: any): 'loading' | 'ready' | 'error' => {
  if (isError(state)) return 'error';
  if (isProcessing(state)) return 'loading';
  return 'ready';
};
