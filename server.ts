import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// Rime Curated Voice Catalog
const RIME_VOICES = [
  { id: 'allison', speaker: 'allison', modelId: 'mistv2', label: 'Allison (Warm Clinical)', gender: 'Female', description: 'Clear, compassionate, and professional clinical tone' },
  { id: 'colin', speaker: 'colin', modelId: 'mistv2', label: 'Colin (Attending Physician)', gender: 'Male', description: 'Calm, authoritative, and articulate medical delivery' },
  { id: 'amber', speaker: 'amber', modelId: 'mistv2', label: 'Amber (Conversational Specialist)', gender: 'Female', description: 'Natural, fluid pacing ideal for consultative reviews' },
  { id: 'cove', speaker: 'cove', modelId: 'mistv2', label: 'Cove (Cardiology Fellow)', gender: 'Male', description: 'Measured, precise pacing with high clarity' },
  { id: 'elena', speaker: 'elena', modelId: 'mistv2', label: 'Elena (Diagnostic Narrator)', gender: 'Female', description: 'Engaging, clear articulation for complex data' },
  { id: 'creek', speaker: 'creek', modelId: 'mistv2', label: 'Creek (Consultant)', gender: 'Male', description: 'Steady, grounded resonance suitable for clinical audits' }
];

// Voice AI Health and Status Endpoint
app.get('/api/voice/status', (_req: Request, res: Response) => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const rimeConfigured = Boolean(process.env.RIME_API_KEY);
  res.json({
    status: 'online',
    geminiConfigured,
    rimeConfigured,
    model: 'gemini-3.8-flash',
    ttsProvider: rimeConfigured ? 'rime' : 'browser-fallback',
    defaultSpeaker: 'allison',
    defaultModel: 'mistv2'
  });
});

// List Available Rime Voices
app.get('/api/voice/rime/voices', (_req: Request, res: Response) => {
  res.json({
    voices: RIME_VOICES,
    rimeConfigured: Boolean(process.env.RIME_API_KEY)
  });
});

// Rime Text-to-Speech Endpoint
app.post('/api/voice/tts', async (req: Request, res: Response) => {
  const rimeApiKey = process.env.RIME_API_KEY;
  if (!rimeApiKey) {
    return res.status(503).json({
      error: 'RIME_API_KEY is not configured on the server. Please add RIME_API_KEY to your server environment or Settings > Secrets to enable hyper-realistic Rime neural speech.',
      rimeConfigured: false
    });
  }

  const { text, speaker = 'allison', modelId = 'mistv2', speedAlpha = 1.0 } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Valid text string is required for speech synthesis.' });
  }

  // Clean Markdown formatting for clean, natural speech
  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[•-]\s/g, '')
    .replace(/⚠️/g, 'Warning: ')
    .replace(/✅/g, '')
    .trim();

  // Rime API character constraint: maximum 1000 characters per request
  const sanitizedText = cleanText.length > 950 ? cleanText.substring(0, 950) + '...' : cleanText;

  try {
    const rimeResponse = await fetch('https://users.rime.ai/v1/rime-tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rimeApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/mp3'
      },
      body: JSON.stringify({
        speaker,
        text: sanitizedText,
        modelId,
        speedAlpha: Number(speedAlpha) || 1.0
      })
    });

    if (!rimeResponse.ok) {
      const errorText = await rimeResponse.text();
      let parsedError = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        parsedError = errorJson.message || errorJson.error || errorText;
      } catch {
        // use raw error text
      }

      console.error(`Rime TTS API Error (${rimeResponse.status}):`, parsedError);

      if (rimeResponse.status === 401 || rimeResponse.status === 403) {
        return res.status(rimeResponse.status).json({
          error: 'The server RIME_API_KEY is invalid or unauthorized. Please verify your Rime API key.'
        });
      }

      if (rimeResponse.status === 429) {
        return res.status(429).json({
          error: 'Rime API rate limit exceeded. Please wait a moment before requesting speech.'
        });
      }

      return res.status(rimeResponse.status).json({
        error: `Rime TTS error: ${parsedError || rimeResponse.statusText}`
      });
    }

    const audioArrayBuffer = await rimeResponse.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
      'Cache-Control': 'no-cache'
    });

    res.send(audioBuffer);
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    console.error('Failed to proxy request to Rime TTS:', errMessage);
    res.status(502).json({
      error: `Network error connecting to Rime TTS service: ${errMessage}`
    });
  }
});

// Voice AI Chat Endpoint
app.post('/api/voice/chat', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to your environment variables or in Settings > Secrets to enable live AI responses.',
      geminiConfigured: false
    });
  }

  const { message, conversationHistory, patientContext, includePatientContext } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message string is required.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `You are CardioVoice AI, the voice and clinical decision-support assistant embedded directly inside the CardioVision 3D (CVS-3D) platform.
Your role is to assist cardiologists, medical professionals, and students by explaining CAD risk predictions, coronary anatomy, TreeSHAP feature attributions, and how to use the CardioVision 3D application.

CORE CLINICAL KNOWLEDGE & RULES:
1. Multi-Vessel CAD Understanding:
   - Coronary Artery Disease (CAD) involves atherosclerotic plaque narrowing epicardial coronary vessels (≥ 50% luminal stenosis).
   - LAD (Left Anterior Descending): Supplies the anterior left ventricular myocardium and interventricular septum. Often termed the "widowmaker" due to high myocardial territory dependency.
   - LCX (Left Circumflex): Courses in the left atrioventricular groove, supplying the lateral and posterior left ventricular myocardium.
   - RCA (Right Coronary Artery): Courses in the right atrioventricular groove, supplying the right ventricle, inferior LV myocardium, and cardiac conduction system (SA node in 60%, AV node in 90%).
2. Machine Learning & Probability Framing:
   - NEVER represent model-predicted probabilities as definitive anatomical findings, confirmed plaque, or diagnostic angiograms.
   - Frame predictions as calibrated ensemble statistical estimates based on clinical input variables, resting ECG, and echocardiographic biomarkers (e.g. RWMA, LVEF).
   - Point out 95% Wilson Confidence Intervals when discussing risk bounds.
3. Explainable AI (TreeSHAP):
   - Explain how TreeSHAP calculates marginal feature contributions relative to population base values.
   - Clarify which features push risk higher (positive SHAP, e.g., Regional Wall Motion Abnormality, low LVEF, elevated LDL) versus lower (protective SHAP, e.g., normal ECG, normal BP, youthful age).
   - Distinguish model feature importance from clinical causality.
4. Application Navigation & Controls:
   - Dashboard: Interactive 3D coronary tree with raycast artery selection, animated camera controls, and risk gauges.
   - Patient Intake: Input clinical vitals, lab markers, and echo findings with real-time smart range validation.
   - Counterfactual Explorer: "What-if" simulation comparing baseline vs modified clinical risk.
   - Model Verification: Accuracy, AUROC, calibration, and demographic fairness metrics.
   - Clinical Report: Printable, PDF-ready summary with doctor qualifications and hospital attestation.
5. Safety & Medical Boundaries:
   - You are an educational and workflow-support assistant, NOT an autonomous doctor.
   - Do not prescribe medications or dictate invasive procedures.
   - Provide concise, clear answers (2-4 sentences by default), and offer to elaborate if the clinician needs deeper physiological explanation.
   - If user asks about current patient data and context is provided below, use ONLY the supplied facts; NEVER fabricate missing numbers or diagnoses.

${includePatientContext && patientContext ? `CURRENT PATIENT ASSESSMENT DATA:
- Demographics: Age ${patientContext.age}, Sex ${patientContext.sex}, BMI ${patientContext.bmi} kg/m²
- Vitals: Systolic BP ${patientContext.systolicBp} mmHg, Smoker: ${patientContext.smoker ? 'Yes' : 'No'}
- Labs: Total Cholesterol ${patientContext.cholesterol} mg/dL, LDL ${patientContext.ldl} mg/dL, HDL ${patientContext.hdl} mg/dL
- Echo/ECG: LVEF ${patientContext.lvef}%, RWMA Region: ${patientContext.rwma}, ST-Elevation: ${patientContext.stElevation ? 'Present' : 'Absent'}
- Model Predictions:
  * Overall CAD Likelihood: ${(patientContext.overallCadProb * 100).toFixed(0)}% (${patientContext.overallCadTier} Risk)
  * LAD Likelihood: ${(patientContext.ladProb * 100).toFixed(0)}% (${patientContext.ladTier} Risk)
  * LCX Likelihood: ${(patientContext.lcxProb * 100).toFixed(0)}% (${patientContext.lcxTier} Risk)
  * RCA Likelihood: ${(patientContext.rcaProb * 100).toFixed(0)}% (${patientContext.rcaTier} Risk)
${patientContext.topDrivers ? `- Key SHAP Risk Drivers: ${patientContext.topDrivers}` : ''}` : 'PATIENT CONTEXT: No patient-specific assessment is currently attached (General Educational Mode).'}`;

    // Format previous turns for context
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(conversationHistory)) {
      // Include last 6 messages for context
      const recent = conversationHistory.slice(-6);
      for (const msg of recent) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: String(msg.content) }]
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.35,
        maxOutputTokens: 800
      }
    });

    const reply = response.text || 'I analyzed your request, but received an empty response. Please try rephrasing your question.';

    res.json({
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Gemini Voice API Error:', errorMsg);

    let friendlyError = `Gemini AI service error: ${errorMsg}`;
    if (errorMsg.includes('API key not valid') || errorMsg.includes('API_KEY_INVALID')) {
      friendlyError = 'The server’s GEMINI_API_KEY is invalid or unauthenticated. Please configure a valid GEMINI_API_KEY in Settings > Secrets or the server environment to enable live AI responses.';
    } else if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota')) {
      friendlyError = 'Gemini API rate limit reached. Please wait a few seconds and try your inquiry again.';
    }

    res.status(500).json({
      error: friendlyError
    });
  }
});

// Start Express server and attach Vite
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CardioVision 3D] Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CardioVision 3D] Server startup failed:', err);
  process.exit(1);
});
