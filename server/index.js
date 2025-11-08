const express = require('express');
const OpenAI = require("openai");
const cors = require("cors");
const path = require("path");

const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/dist')));

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

// Helper function to parse array string response
const parseArrayResponse = (responseText) => {
    try {
        // Remove markdown code blocks if present
        let cleaned = responseText.replace(/```json|```javascript|```/g, '').trim();
        
        // Try JSON.parse first (handles double quotes)
        try {
            return JSON.parse(cleaned);
        } catch (e) {
            // If JSON.parse fails, try replacing single quotes with double quotes
            cleaned = cleaned.replace(/'/g, '"');
            return JSON.parse(cleaned);
        }
    } catch (error) {
        console.error("Failed to parse array response:", error);
        // Return empty array as fallback
        return [];
    }
};

app.post("/api/auto", async (req, res) => {
    let resp;
    const { main, level, depth} = req.body;
    try {
        let response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
                role: "user",
                content: `List 3–5 ${depth}-level subtopics of ${main}, useful for a ${level} learner. Return ONLY a valid JSON array of strings, each ≤5 words. Example format: ["topic 1", "topic 2", "topic 3"]`
            }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        console.log("OpenAI auto response:", content);

        // Parse the JSON response
        const parsed = JSON.parse(content);
        // Handle both direct array and object with array property
        resp = Array.isArray(parsed) ? parsed : (parsed.topics || parsed.subtopics || Object.values(parsed)[0] || []);
    } catch (error) {
        console.error("OpenAI API error (auto):", error.message);
        resp = [];
    }

    console.log("Auto result:", resp);
    res.json(resp);
})



app.post("/api/learn", async (req, res) => {
    let resp;
    const { main, level, depth, sub, goal } = req.body;
    try {
        const medium = "video tutorial or course";
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
                role: "user",
                content: `For each of these subtopics: ${JSON.stringify(sub)}, recommend one high-quality ${medium} URL about ${main} at ${depth} level, suitable for a ${level} learner${goal ? ` who wants to ${goal}` : ''}.

Return ONLY a valid JSON object with a "resources" array containing the URLs in the exact same order as the subtopics. Each URL should be from popular educational platforms (YouTube, Coursera, edX, Khan Academy, freeCodeCamp, Udemy, etc.).

Format: {"resources": ["https://url1.com", "https://url2.com", ...]}`
            }],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        console.log("OpenAI learn response:", content);

        const parsed = JSON.parse(content);
        resp = parsed.resources || parsed.urls || parsed.links || [];
    } catch (error) {
        console.error("OpenAI API error (learn):", error.message);
        resp = [];
    }

    console.log("Learn result:", resp);
    res.json(resp);
})

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
})

// Catch-all route to serve React app for all other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on PORT ${PORT}`)
})