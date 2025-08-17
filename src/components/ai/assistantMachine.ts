import { createMachine } from 'xstate';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

interface AssistantContext {
  history: ChatMessage[];
  transcript: string;
  response: string;
}

// Note: explicit event typing not required for this simple XState machine

export const assistantMachine = createMachine({
  id: 'assistant',
  context: {
    history: [] as ChatMessage[],
    transcript: 'Click the microphone to start speaking...',
    response: '',
  } as AssistantContext,
  on: {
    SET_TRANSCRIPT: {
      actions: ({ context, event }) => {
        context.transcript = event.content;
      }
    },
    ADD_USER: {
      actions: ({ context, event }) => {
        // Prevent duplicate user messages
        const lastMessage = context.history[context.history.length - 1];
        if (lastMessage?.role === 'user' && lastMessage.content === event.content) {
          console.log(`XState: Skipping duplicate user message: "${event.content}"`);
          return; // Skip duplicate
        }
        console.log(`XState: Adding user message: "${event.content}"`);
        context.history = [...context.history, { role: 'user', content: event.content }];
      }
    },
    ADD_ASSISTANT: {
      actions: ({ context, event }) => {
        context.history = [...context.history, { role: 'assistant', content: event.content }];
        context.response = event.content;
      }
    },
    CLEAR: {
      actions: ({ context }) => {
        context.history = [];
        context.transcript = 'Click the microphone to start speaking...';
        context.response = '';
      }
    }
  }
});


