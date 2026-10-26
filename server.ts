import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Agent analysis endpoint
app.post('/api/analyze-agent', async (req, res) => {
  try {
    const { agentId, systemPrompt, records, userOptions } = req.body;

    if (!records || !Array.isArray(records)) {
      res.status(400).json({ error: 'Missing records array' });
      return;
    }

    if (!ai) {
      // Signal client that server-side Gemini is not configured, client deterministic engine will run
      res.status(200).json({
        success: false,
        fallbackToClient: true,
        message: 'GEMINI_API_KEY is not configured on server. Falling back to local clinical intelligence engine.',
      });
      return;
    }

    // Call Gemini with gemini-3.8-flash
    const prompt = `
System Role & Instruction:
${systemPrompt}

User Configuration:
${JSON.stringify(userOptions || {})}

Input Patient Records (Total: ${records.length}):
${JSON.stringify(records, null, 2)}

Provide your full, comprehensive analysis strictly following the agent prompt tasks. Return a JSON object with:
1. "agentId": "${agentId}"
2. "status": "completed"
3. "timestamp": "${new Date().toISOString()}"
4. "summary": A concise overview of findings
5. "findings": An array of evaluated cases matching the exact steps defined in your role
6. "recommendations": An array of actionable managerial and operational recommendations
7. "metrics": Relevant operational and clinical metrics
8. "executiveNotes": High-level bullet points for hospital leadership
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = { rawText: text };
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini Agent Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error processing AI agent analysis',
      fallbackToClient: true,
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clinical Virtual-Office Portal running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
