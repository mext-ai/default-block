# AI in a Mexty block: `@mexty/ai`

A block reaches a language model in one way only: **`@mexty/ai`**, through an
**AI Activity** its author configured on Mexty. The activity decides which
models may run (Claude, GPT, Gemini, Mistral), the system prompt, the output
cap and the budgets; the platform bills the credits.

Never use `@google/genai`, `openai` or any other provider SDK, and never call a
provider's API directly: there is no key in the browser and no proxy, so those
calls fail. (The old `@google/genai` + `"DUMMY"` key path is retired.)

---

## 1. Declare the prop

In your `BlockProps` interface, verbatim:

```ts
/** Mexty AI activity this block runs models through. Staff-managed. */
aiActivityId?: string;
```

Linking the block to the activity is done by Mexty staff (blueprint editor or
the MCP's `link_ai_activity_block`). An unlinked block still renders; its runs
answer with an error the block shows.

## 2. Add the package

Add to `package.json` dependencies, keeping every existing entry:

```json
"@mexty/ai": "^0.1.0"
```

## 3. Use it

```tsx
import { useMextyAi, useAiRun, useAiModels } from '@mexty/ai';

const ai = useMextyAi(props.aiActivityId);

// One streamed answer. `text` fills in as it streams; `result.metadata` has the
// model that ran, token usage and creditsCost.
const { text, isStreaming, result, error, run, stop } = useAiRun(ai, { provider: 'gemini', tier: 'fast' });
run('Why is the sky blue?');

// Compare models: one hook per provider, same prompt.
const claude = useAiRun(ai, { provider: 'claude' });
const gpt = useAiRun(ai, { provider: 'gpt' });

// What this block may run right now (provider, tier, label), for a picker.
const { models } = useAiModels(ai);
```

For a conversation, pass a message list ending on `user`:
`run([{ role: 'user', content: '…' }, { role: 'assistant', content: '…' }, { role: 'user', content: '…' }])`.
The activity's system prompt is added on the server.

## Rules

- `ai.status` is `'ready' | 'no-activity' | 'sandbox' | 'unauthenticated'`.
  Render normally in all four; a client that is not ready puts an `AiRunError`
  in `error` instead of streaming.
- A refused run carries `error.status` and `error.reason` (400 model not
  allowed, 402 `'owner-credits' | 'learner-budget' | 'activity-budget'`,
  423 paused). Show it; never retry in a loop.
- Whatever the block puts in the messages goes to a third-party model provider:
  never other learners' data, saved rows, or anything the learner did not type
  or explicitly choose.
- Never name a model id, never set a system prompt, never hold a key.
- Do not call `configure()`: the platform resolves the server.
