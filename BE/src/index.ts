import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from './prompt';
import { nodeBasePrompt } from "./defaults/node";
import { reactBasePrompt } from "./defaults/react";
import cors from "cors";

const GM_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GM_API_KEY as string);
const generationConfig = {
    stopSequences: ['red'], // stops when model encounters a new line 
    maxOutputTokens: 8000,
    temperature: 0.1,
    topP: 0.9,
    topK: 40,
};
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig });

const app = express();
app.use(cors());
app.use(express.json());

app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;

    const fullPrompt = `${BASE_PROMPT}\n\n${prompt}`;
    const systemMessage = `Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra`;
    
    const messages = [
        { role: "system", content: systemMessage },
        { role: "user", content: fullPrompt }
    ];

    const response = await model.generateContentStream(messages.map(msg => msg.content).join("\n\n"));

    let answer = "";
    for await (const chunk of response.stream) {
        answer += chunk.text();
    }

    if (answer.trim() === "react") {
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        });
        return;
    }

    if (answer.trim() === "node") {
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        });
        return;
    }

    res.status(403).json({ message: "You can't access this" });
    return;
});

app.post("/chat", async (req, res) => {
    const messages = req.body.messages;
    const systemMessage = getSystemPrompt();

    const response = await model.generateContentStream([
        { role: "system", content: systemMessage },
        ...messages
    ].map(msg => msg.content).join("\n\n"));

    let fullResponse = "";
    for await (const chunk of response.stream) {
        fullResponse += chunk.text();
    }

    res.json({
        response: fullResponse
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
