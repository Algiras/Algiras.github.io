# Algimantas CV

Personal CV website

## License

This project is open source and available under the MIT License.

## Optional: Offline Kokoro TTS (for GitHub Pages)

To enable in-browser Kokoro (Transformers.js) without fetching from Hugging Face at runtime, place model assets in:

```
public/models/hexgrad/Kokoro-82M/
  config.json
  tokenizer.json
  model.onnx (or the appropriate ONNX file)
  generation_config.json (if provided)
  ...any extra files required by the pipeline
```

At runtime the app prefers `/models` and falls back to remote fetches; if remote is blocked, it will fall back to built‑in Speech Synthesis.
