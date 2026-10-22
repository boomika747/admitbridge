const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
// Serve the static HTML/CSS/JS files from the 'public' directory
app.use(express.static('public')); 

// Initialize the Gemini client if key is provided or in test environment
let ai = null;
let chat = null;

const apiKey = process.env.GEMINI_API_KEY || (process.env.NODE_ENV === 'test' ? 'test_key' : '');
if (apiKey && apiKey !== 'your_google_gemini_api_key_here') {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (e) {
        console.warn("Could not instantiate Gemini client:", e.message);
    }
}

const projectContext = `
PROJECT NAME: AdmitBridge - Masters Admission Intelligence Platform
DESCRIPTION: A centralized admission intelligence platform to help students make smarter decisions for international Master's applications. It provides university recommendations, consultancy transparency, admission analytics, profile-based predictions, and application tracking.
TECH STACK: Frontend: React.js, HTML5, CSS3, JavaScript | Backend: Node.js, Express.js, Flask | Database: FileSystem / MongoDB ready | Authentication: JWT
KEY FEATURES: Student & Consultancy Management, AI-Based Profile Match Predictor, Consultancy Transparency System, Rejection Analytics Engine, Application Management, Payment System, and Notification System.
`;

async function initializeChat() {
    if (!ai) return;
    try {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are an expert AI assistant for the AdmitBridge project. Your goal is to answer user questions about AdmitBridge completely and in a user-friendly way. Always provide a clear example. Maintain conversational continuity by connecting current answers to previous context if relevant.\n\nProject Context:\n${projectContext}`
            }
        });
        console.log("Gemini Chat Session Initialized.");
    } catch (error) {
        console.warn("Could not initialize Gemini chat session:", error.message);
    }
}

initializeChat();

function generateLocalReply(message) {
    const q = (message || '').toLowerCase();
    if (q.includes('what is') || q.includes('about') || q.includes('admitbridge')) {
        return "🎓 **AdmitBridge** is a unified, AI-powered university admission and consultancy management platform. It offers data-driven university recommendations, profile match predictions, consultancy transparency, and end-to-end application tracking.";
    }
    if (q.includes('feature') || q.includes('services')) {
        return "✨ **Key Features of AdmitBridge:**\n- **College Finder ML Engine**: Predicts your admission chances based on GRE, TOEFL, CGPA, and budget.\n- **Consultancy Transparency**: Compare consultancies by genuine success rates and student reviews.\n- **Application Tracker**: Real-time status updates from submission to visa approval.\n- **Document Vault**: Secure document upload and management.";
    }
    if (q.includes('college') || q.includes('recommend') || q.includes('finder')) {
        return "🏫 You can access the **College Finder** directly from the Student Dashboard! It analyzes your academic profile (GRE, CGPA, branch, budget) and matches you with top universities fitting your budget and chances.";
    }
    if (q.includes('consultancy') || q.includes('consultant')) {
        return "🏢 Consultancies have a dedicated portal at port **5174** where they review assigned students, verify documents, and schedule evaluation meetings.";
    }
    if (q.includes('admin') || q.includes('portal')) {
        return "⚙️ The **Admin Portal** runs at port **5175** providing system oversight, analytics, and consultancy verification tools.";
    }
    return `🤖 **AdmitBridge Assistant**: Thanks for asking! AdmitBridge helps students navigate international master's admissions with AI-driven matching and consultancy management. Feel free to explore the Student Portal, College Finder, and Application Tracker!`;
}

async function handleChat(req, res) {
    try {
        const { message } = req.body;
        if (chat) {
            const response = await chat.sendMessage({ message: message });
            if (response && response.text) {
                return res.json({ reply: response.text });
            }
        }
        // Fallback response when GEMINI_API_KEY is not configured
        const reply = generateLocalReply(message);
        res.json({ reply });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Failed to communicate with AI" });
    }
}

// API Endpoints to handle frontend messages (both /api/chat and /chat)
app.post('/api/chat', handleChat);
app.post('/chat', handleChat);

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 AdmitBridge Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;