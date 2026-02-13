# Algimantas K. - Portfolio

Personal portfolio website and collection of open-source projects.

## 🎯 Featured Projects

**Knowledge & AI Systems**
- 🧠 [RKnowledge](https://algiras.github.io/RKnowledge/) - Knowledge graph extraction & visualization
- 🤖 [Skillz](https://algiras.github.io/skillz/) - Self-extending MCP server
- 📚 [Memory Palace](https://algiras.github.io/memory-palace/) - Durable knowledge system
- 📊 [EmbedEval](https://algiras.github.io/embedeval/) - LLM evaluation framework

**Tools & Documentation**
- ✅ [Clean Docs](https://algiras.github.io/clean-docs/) - Documentation validator & CI/CD tool

**Creative Works**
- 📖 [Complex Parenting](https://algiras.github.io/complex-parenting/) - Guide for Double Diagnosis
- 🐺 [Wolf Saga](https://algiras.github.io/wolf-saga/) - Epic dark fantasy (Lithuanian)

## 📡 For AI & LLMs

**AI-Readable Portfolio:** See [.well-known/llms.txt](.well-known/llms.txt) for complete project discovery and descriptions.

## 🔗 Connect

- **GitHub:** [github.com/Algiras](https://github.com/Algiras)
- **LinkedIn:** [linkedin.com/in/algimantas-karpavicius](https://linkedin.com/in/algimantas-karpavicius)
- **Portfolio:** [algiras.github.io](https://algiras.github.io/)

## 📝 License

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
