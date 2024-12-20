# Google Generative AI Provider

The Google Generative AI provider contains language and embedding model support for the Google Generative AI APIs.

## Setup

The Google provider is available in the `@ai-sdk/google` module. You can install it with:

```bash
pnpm add @ai-sdk/google
```

## Provider Instance

You can import the default provider instance `google` from `@ai-sdk/google`:

```javascript
import { google } from '@ai-sdk/google';
```

If you need a customized setup, you can import `createGoogleGenerativeAI` from `@ai-sdk/google` and create a provider instance with your settings:

```javascript
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  // custom settings
});
```

### Optional Settings

- **baseURL**: `string`  
  Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://generativelanguage.googleapis.com/v1beta`.

- **apiKey**: `string`  
  API key that is being sent using the `x-goog-api-key` header. It defaults to the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable.

- **headers**: `Record<string,string>`  
  Custom headers to include in the requests.

- **fetch**: `(input: RequestInfo, init?: RequestInit) => Promise<Response>`  
  Custom fetch implementation. Defaults to the global fetch function. You can use it as middleware to intercept requests or provide a custom fetch implementation for testing.

## Language Models

You can create models that call the Google Generative AI API using the provider instance. The first argument is the model id, e.g. `gemini-1.5-pro-latest`. The models support tool calls and some have multi-modal capabilities.

```javascript
const model = google('gemini-1.5-pro-latest');
```

You can use fine-tuned models by prefixing the model id with `tunedModels/`, e.g. `tunedModels/my-model`.

Google Generative AI models support model-specific settings that are not part of the standard call settings. You can pass them as an options argument:

```javascript
const model = google('gemini-1.5-pro-latest', {
  safetySettings: [
    { category: 'HARM_CATEGORY_UNSPECIFIED', threshold: 'BLOCK_LOW_AND_ABOVE' },
  ],
});
```

### Available Safety Settings

The safety settings can use the following categories:
- HARM_CATEGORY_HATE_SPEECH
- HARM_CATEGORY_DANGEROUS_CONTENT  
- HARM_CATEGORY_HARASSMENT
- HARM_CATEGORY_SEXUALLY_EXPLICIT

With the following thresholds:
- HARM_BLOCK_THRESHOLD_UNSPECIFIED
- BLOCK_LOW_AND_ABOVE
- BLOCK_MEDIUM_AND_ABOVE
- BLOCK_ONLY_HIGH
- BLOCK_NONE

### Text Generation

You can use Google Generative AI language models to generate text:

```javascript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const { text } = await generateText({
  model: google('gemini-1.5-pro-latest'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

The models can also be used with `streamText`, `generateObject`, `streamObject`, and `streamUI` functions (see AI SDK Core and AI SDK RSC).

## File Inputs

The Google Generative AI provider supports file inputs, including PDF files:

```javascript
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const result = await generateText({
  model: google('gemini-1.5-flash'),
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What is an embedding model according to this document?',
        },
        {
          type: 'file',
          data: fs.readFileSync('./data/ai.pdf'),
          mimeType: 'application/pdf',
        }
      ],
    }
  ],
});
```

## Model Capabilities

| Model | Image Input | Object Generation | Tool Usage | Tool Streaming |
|-------|-------------|-------------------|------------|----------------|
| gemini-2.0-flash-exp | ✓ | ✓ | ✓ | ✓ |
| gemini-1.5-pro-latest | ✓ | ✓ | ✓ | ✓ |
| gemini-1.5-pro | ✓ | ✓ | ✓ | ✓ |
| gemini-1.5-flash-latest | ✓ | ✓ | ✓ | ✓ |
| gemini-1.5-flash | ✓ | ✓ | ✓ | ✓ |

## Embedding Models

You can create models that call the Google Generative AI embeddings API using the `textEmbeddingModel()` factory method:

```javascript
const model = google.textEmbeddingModel('text-embedding-004');
```

### Optional Settings

- **outputDimensionality**: `number`  
  Optional reduced dimension for the output embedding. If set, excessive values in the output embedding are truncated from the end.

```javascript
const model = google.textEmbeddingModel('text-embedding-004', {
  outputDimensionality: 512, // optional, number of dimensions for the embedding
});
```

### Embedding Model Capabilities

| Model | Default Dimensions | Custom Dimensions |
|-------|-------------------|-------------------|
| text-embedding-004 | 768 | ✓ |