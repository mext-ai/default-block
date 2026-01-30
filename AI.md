# Using @google/genai in React blocks

> **Note:** This file should live in the default block template repo (e.g. `AI.md` at the repo root) so every new block has it. The Block Developer Agent is instructed to read it before writing any AI code.

This document describes how to use **@google/genai** in **React components** in Mexty blocks. Blocks run **only in the browser** (never on the backend). A service worker proxies requests, so you always use the API key `"DUMMY"` in code.

**Package:** `@google/genai`  
**Docs:** [Google Gen AI JS SDK](https://googleapis.github.io/js-genai/)

---

## Installation

```json
"@google/genai": "1.34.0"
```

Use this exact version in `package.json`.

---

## Initialization

Create the client once (e.g. at module level or in a ref). Always use `apiKey: "DUMMY"`. Do not use `process.env` or any other value — this code runs in the browser.

```tsx
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: "DUMMY" });
```

---

## Generate text (non-streaming)

Use `ai.models.generateContent()`. The result is a **response object**.

- **Correct:** `response.text` — it is a **property** (string), not a function.
- **Wrong:** `response.text()` — there is no `.text()` method.

```tsx
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Why is the sky blue?',
});

// ✅ Correct: response.text is a property
setOutput(response.text ?? '');
```

---

## Stream text

Use `ai.models.generateContentStream()`. It returns an **async iterable** of chunks. In React, accumulate chunks in state.

- Iterate with `for await (const chunk of response)`.
- Each `chunk` has a **property** `chunk.text` (not `chunk.text()`).

```tsx
const [streamedText, setStreamedText] = useState('');

const response = await ai.models.generateContentStream({
  model: 'gemini-2.5-flash',
  contents: 'Write a short poem.',
});

// ✅ Correct: for await... of, then chunk.text (property)
for await (const chunk of response) {
  if (chunk.text) {
    setStreamedText((prev) => prev + chunk.text);
  }
}
```

---

## Multimodal input (text + image)

Use the **Interactions API** (`ai.interactions.create`) to send text and images (or other modalities). Pass an array of parts: `{ type: 'text', text: '...' }` and `{ type: 'image', data: base64String, mime_type: 'image/png' }`. In the browser, get base64 from a file input (e.g. `FileReader.readAsDataURL` then strip the data URL prefix) or from a canvas.

```tsx
// base64Image: string (e.g. from <input type="file"> + FileReader)
const interaction = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: [
    { type: 'text', text: 'Describe the image.' },
    { type: 'image', data: base64Image, mime_type: 'image/png' },
  ],
});

// Get text from interaction.outputs (e.g. first text output)
const textOutput = interaction.outputs?.find((o) => o.type === 'text');
setOutput(textOutput?.text ?? '');
```

---

## Function calling (custom tools)

Define tools the model can call; then run your own logic and send the result back via a follow-up `ai.interactions.create` with `previous_interaction_id` and `input: [{ type: 'function_result', ... }]`.

```tsx
const getWeather = (location: string) => {
  return `The weather in ${location} is sunny.`;
};

let interaction = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'What is the weather in Mountain View, CA?',
  tools: [
    {
      type: 'function',
      name: 'get_weather',
      description: 'Gets the weather for a given location.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA',
          },
        },
        required: ['location'],
      },
    },
  ],
});

for (const output of interaction.outputs ?? []) {
  if (output.type === 'function_call') {
    const result = getWeather(String(output.arguments?.location ?? ''));
    interaction = await ai.interactions.create({
      model: 'gemini-2.5-flash',
      previous_interaction_id: interaction.id,
      input: [
        {
          type: 'function_result',
          name: output.name,
          call_id: output.id,
          result,
        },
      ],
    });
  }
}

// Final text response
const textOutput = interaction.outputs?.find((o) => o.type === 'text');
setOutput(textOutput?.text ?? '');
```

---

## Built-in tools

**Google Search** (grounding):

```tsx
const interaction = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'Who won the last Super Bowl?',
  tools: [{ type: 'google_search' }],
});
setOutput(interaction.outputs?.[0]?.text ?? '');
```

**Code execution:**

```tsx
const interaction = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'Calculate the 50th Fibonacci number.',
  tools: [{ type: 'code_execution' }],
});
setOutput(interaction.outputs?.[0]?.text ?? '');
```

---

## Multimodal output (e.g. image generation)

Request image output with `response_modalities: ['image']`. In the browser, use each output’s `data` (base64) as a **data URL** for `<img src={...} />` or state; do not use `fs` (no Node in the browser).

```tsx
const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

const interaction = await ai.interactions.create({
  model: 'gemini-3-pro-image-preview',
  input: 'Generate an image of a futuristic city.',
  response_modalities: ['image'],
});

for (const output of interaction.outputs ?? []) {
  if (output.type === 'image' && output.data) {
    const dataUrl = `data:${output.mime_type ?? 'image/png'};base64,${output.data}`;
    setGeneratedImageUrl(dataUrl);
  }
}

// In JSX: {generatedImageUrl && <img src={generatedImageUrl} alt="Generated" />}
```

---

## Summary

| Use case           | Method / API                    | How to get text / result        |
|--------------------|---------------------------------|----------------------------------|
| One-shot           | `generateContent(...)`          | `response.text`                  |
| Streaming          | `generateContentStream(...)`    | `for await (chunk of response)` then `chunk.text` |
| Multimodal input   | `ai.interactions.create`        | `input: [{ type: 'text', ... }, { type: 'image', data, mime_type }]` |
| Function calling   | `ai.interactions.create` + tools| Handle `output.type === 'function_call'`, then create with `function_result` |
| Built-in tools     | `ai.interactions.create` + `tools: [{ type: 'google_search' }]` etc. | `interaction.outputs` |
| Image output       | `ai.interactions.create` + `response_modalities: ['image']` | `output.type === 'image'`, `output.data` (base64) → data URL for `<img>` |

- **Always:** `response.text` and `chunk.text` (property), never `.text()`.
- **Always:** `apiKey: "DUMMY"` when creating `GoogleGenAI`.
- **Context:** React only — this code runs in the browser, never on the backend. No `fs` or Node APIs; use data URLs or state for binary output.
