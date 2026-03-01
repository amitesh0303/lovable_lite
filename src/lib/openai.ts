import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not configured. AI generation features will not work.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface GeneratedApp {
  files: Record<string, string>;
  description: string;
  framework: string;
}

export async function generateAppFromPrompt(prompt: string): Promise<GeneratedApp> {
  const systemPrompt = `You are an expert React/Tailwind developer. Generate a complete, production-ready React + Tailwind CSS application based on the user's prompt.

Return a JSON object with this structure:
{
  "description": "Brief description of what was generated",
  "framework": "React + Tailwind",
  "files": {
    "src/App.tsx": "...",
    "src/components/Header.tsx": "...",
    "src/pages/Home.tsx": "...",
    "src/index.css": "...",
    "package.json": "...",
    "tailwind.config.js": "..."
  }
}

Requirements:
- Use React with TypeScript
- Use Tailwind CSS for all styling (no inline styles)
- Create meaningful components and pages
- Include proper TypeScript types
- Make it look professional and polished
- Include a navigation header
- Use a clean, modern design with proper spacing and colors
- Keep each file focused and well-organized`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Build me: ${prompt}` },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 4000,
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result as GeneratedApp;
}

export async function generateCodeEdit(
  prompt: string,
  currentFiles: Record<string, string>,
  chatHistory: Array<{ role: string; content: string }>
): Promise<Record<string, string>> {
  const filesContext = Object.entries(currentFiles)
    .map(([path, content]) => `=== ${path} ===\n${content}`)
    .join('\n\n');

  const systemPrompt = `You are an expert React/Tailwind developer helping to modify an existing application.

Current project files:
${filesContext}

When the user requests changes, return a JSON object with the files that need to be modified:
{
  "files": {
    "path/to/modified/file.tsx": "complete new file content",
    ...
  },
  "summary": "Brief description of changes made"
}

Only include files that need to be changed. Return complete file contents (not diffs).`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...chatHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: prompt },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    response_format: { type: 'json_object' },
    max_tokens: 4000,
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return result.files || {};
}
