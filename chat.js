const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the GoogleGenerativeAI with your API key
const genAI = new GoogleGenerativeAI("AIzaSyBFkbKEFa2X5f8ox5Y4mUeE0TwiNPzj18g"); // Replace with your actual Gemini API key

// Attempt to get the generative model
let model;
try {
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Specify the model you want to use
} catch (error) {
    console.error("Error initializing the model:", error.message);
    process.exit(1); // Exit if model initialization fails
}

// Middleware to parse JSON and enable CORS
app.use(express.json());
app.use(cors());

// Endpoint to handle chat requests
app.post('/chat', async (req, res) => {
    let { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Modify prompt before sending to the model
    prompt = "You are an AI assistant for the TCE SportsCard app. Your job is to answer only sports-related questions. If the question involves anything outside of sports, your response should be: 'Sorry, I have trouble answering your question. I am an AI chatbox for the TCE SportsCard app, and I only answer questions related to sports.'For any sports-related question, answer it in a small, clear, and understandable manner. For any identity related question like who are you what is ur name say I am an AI chatbox for the TCE SportsCard app, and I only answer questions related to sports.Make sure your answers are as brief as possible, without unnecessary details use lenghty texts if only they are specified in the prompt. Avoid using phrases like 'Sure, here is...' or 'Okay.' Also, do not reveal that you are an AI assistant unless specifically asked. Always respond directly and concisely.If the question is related to something other than sports, immediately respond with: 'Sorry, I have trouble answering your question. I am an AI chatbox for the TCE SportsCard app, and I only answer questions related to sports.'Now, answer the following prompt: " + prompt;


    try {
        // Generate content using Gemini AI model
        const result = await model.generateContent(prompt);

        // Extract the generated answer (depending on how the API returns data)
        const answer = result.response.text ? result.response.text() : 'No response text available';

        // Return the generated response to the client
        res.json({ answer });
    } catch (error) {
        console.error('Error interacting with Gemini AI:', error.message);
        res.status(500).json({ error: 'Failed to generate content from Gemini AI' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
