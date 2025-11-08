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
app.use(express.static(path.join(__dirname, '../client/dist')));

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
    let response = await client.responses.create({
        model: "gpt-5-mini", // go mini or nomal if this doesnt work
        //tools: [{ type: "web_search"}],
        input: 
        `List 3–5 ${depth}-level subtopics of ${main}, 
        useful for a ${level} learner. 
        Return only a JS list of strings ≤5 words.`
    })
    // let resp = response.output_text;
    // // Use the helper function that handles single quotes correctly
    // let array = parseArrayResponse(resp);
    // console.log(typeof array, array); 
    // res.json(array);
        resp = response.output_text
    } catch (error) {
        resp = []
    } finally {
        let array
        try {
            if (resp.startsWith('"') && resp.endsWith('"')) {
                resp = "'" + resp.slice(1, -1) + "'";
            }
            array = JSON.parse(resp)
        } catch (error) {
            console.error("unparsable auto")
            array = []
        }
        console.log(typeof array, array)
        // Parse the string array into an actual array
        res.json(array);
    }
    

    
})



app.post("/api/learn", async (req, res) => {
    let resp;
    const { main, level, depth, sub, goal } = req.body;
    try {
        let medium = "video"
        let response = await client.responses.create({
            model: "gpt-5", 
            tools: [{ type: "web_search"}],
            input: `For each subtopic in ${sub}, give one ${medium} link about ${main} 
            at ${depth} level, useful to a ${level} learning to ${goal}.  
            Return JS list of links.  
            No JSON, no extra colons, keep order.`
        })
        resp = response.output_text
    } catch (error) {
        resp = []
    } finally {
        let array
        try {
            if (resp.startsWith('"') && resp.endsWith('"')) {
                resp = "'" + resp.slice(1, -1) + "'";
            }
            array = JSON.parse(resp)
        } catch (error) {
            console.error("unparsable learn")
            array = []
        }
        console.log(typeof array, array)
        // Parse the string array into an actual array
        res.json(array);
    }


    // app.get("/api/learn", (req, res) => {
//     // const {main, subtopic, } = req.body
//     client.responses.create({
//         model: "gpt-5", 
//         tools: [{ type: "web_search"}],
//         input: "say smth", 
//     })
//     .then(data => data.json(res.output_text))
// .then(console.log(res))

})

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
})

// Catch-all route to serve React app for all other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on PORT ${PORT}`)
})