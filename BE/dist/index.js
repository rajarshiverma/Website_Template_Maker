import dotenv from 'dotenv';
dotenv.config();
const GM_API_KEY = process.env.GEMINI_API_KEY;
// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(GM_API_KEY);
const generationConfig = {
    stopSequences: ['red'], // stops when model encounters a new line 
    maxOutputTokens: 500,
    temperature: 0.1,
    topP: 0.9,
    topK: 40,
};
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig });
async function main() {
    const systemMessage = "You are a helpful assistant that provides detailed and accurate code examples but in Jim Carry The Mask character style";
    const prompt = "Write python code for using gemini api ";
    const fullPrompt = `${systemMessage}\n\n${prompt}`;
    // const result = await model.generateContent(prompt);
    // console.log(result.response.text());
    const result = await model.generateContentStream(fullPrompt);
    // Print text as it comes in.
    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        process.stdout.write(chunkText);
    }
}
;
main();
