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

export async function getSharedEngine(initProgressCallback?: InitProgressCallback): Promise<any> {
  if (typeof window !== 'undefined' && (window as any).__mlcEngine) {
    return (window as any).__mlcEngine;
  }
  if (!enginePromise) {
    enginePromise = (async () => {
      await ensurePersistentStorage();
      const webllm = await import('@mlc-ai/web-llm');
      const { CreateMLCEngine } = webllm as any;
      // Prefer a consistent small model to maximize cache reuse across the app
      const preferredModels = [
        'Qwen2-0.5B-Instruct-q4f16_1-MLC',
        'Llama-3.2-1B-Instruct-q4f32_1-MLC',
      ];
      let engine: any | null = null;
      for (const model of preferredModels) {
        try {
          engine = await CreateMLCEngine(model, initProgressCallback ? { initProgressCallback } : {});
          break;
        } catch {
          // try next
        }
      }
      if (!engine) {
        // Last resort: try a generic model id, will likely fail if unavailable
        engine = await CreateMLCEngine('Qwen2-0.5B-Instruct-q4f16_1-MLC', initProgressCallback ? { initProgressCallback } : {});
      }
      if (typeof window !== 'undefined') {
        (window as any).__mlcEngine = engine;
      }
      return engine;
    })();
  }
  return enginePromise;
}


