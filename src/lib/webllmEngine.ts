// Shared WebLLM engine singleton to avoid re-downloading models on each mount
// and to centralize storage persistence.

let enginePromise: Promise<any> | null = null;

export type InitProgressCallback = (report: any) => void;

async function ensurePersistentStorage(): Promise<void> {
  try {
    if ((navigator as any)?.storage?.persist) {
      await (navigator as any).storage.persist();
    }
  } catch {
    // ignore
  }
}

export async function getSharedEngine(
  initProgressCallback?: InitProgressCallback, 
  preferredModel?: string
): Promise<any> {
  const cacheKey = preferredModel || 'default';
  const windowKey = `__mlcEngine_${cacheKey}`;
  
  if (typeof window !== 'undefined' && (window as any)[windowKey]) {
    return (window as any)[windowKey];
  }
  
  // Reset engine promise if we're requesting a different model
  if (preferredModel && enginePromise) {
    enginePromise = null;
  }
  
  if (!enginePromise) {
    enginePromise = (async () => {
      await ensurePersistentStorage();
      const webllm = await import('@mlc-ai/web-llm');
      const { CreateMLCEngine } = webllm as any;
      
      let engine: any | null = null;
      
      // Try the preferred model first if specified
      if (preferredModel) {
        try {
          engine = await CreateMLCEngine(preferredModel, initProgressCallback ? { initProgressCallback } : {});
        } catch (error) {
          console.warn(`Failed to load preferred model ${preferredModel}:`, error);
        }
      }
      
      // Fallback to default models if preferred model failed or wasn't specified
      if (!engine) {
        const fallbackModels = [
          'Llama-3.2-3B-Instruct-q4f32_1-MLC',
          'Llama-3.2-1B-Instruct-q4f32_1-MLC',
          'Qwen2-0.5B-Instruct-q4f16_1-MLC',
        ];
        
        for (const model of fallbackModels) {
          try {
            engine = await CreateMLCEngine(model, initProgressCallback ? { initProgressCallback } : {});
            break;
          } catch {
            // try next
          }
        }
      }
      
      if (!engine) {
        throw new Error('Failed to initialize any WebLLM model');
      }
      
      if (typeof window !== 'undefined') {
        (window as any)[windowKey] = engine;
      }
      return engine;
    })();
  }
  return enginePromise;
}


