import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const app = express();
const upload = multer();
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
app.use(cors());
app.use(express.json());
app.use(express.static('./'));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/chat', async (req, res) => {
    const { prompt, mode } = req.body;

    try {
        let generationConfig = {
            temperature: 0.7, 
            topK: 40,
            topP: 0.95,
        };

        let systemInstruction = "Kamu adalah asisten AI yang cerdas dan membantu.";
        if (mode === 'creative') {
            generationConfig.temperature = 1.5;
            systemInstruction = "Kamu adalah seorang penulis kreatif. Gunakan bahasa yang indah, penuh imajinasi, dan deskriptif.";
        } else if (mode === 'factual') {
            generationConfig.temperature = 0.2;
            systemInstruction = "Kamu adalah asisten ahli yang faktual. Jawablah dengan singkat, padat, dan sertakan data jika ada. Jangan beropini.";
        }

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            systemInstruction: systemInstruction,
            generationConfig: generationConfig,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        res.status(200).json({ 
            result: response.text,
            metadata: { mode, config: generationConfig } 
        });

    } catch (e) {
        console.error("Error detail:", e);
        res.status(500).json({ 
            message: "Terjadi kesalahan pada server",
            error: e.message 
        });
    }
});