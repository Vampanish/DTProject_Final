const express = require('express');
const app = express();

let timerValue = 600; // 10 minutes
let timerRunning = false;

const updateTimer = () => {
    if (timerRunning && timerValue > 0) {
        timerValue--;
    }
};

setInterval(updateTimer, 1000); // Update timer every second

// SSE endpoint for timer updates
app.get('/timer-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendTimer = () => {
        res.write(`data: ${timerValue}\n\n`);
    };

    const interval = setInterval(sendTimer, 1000);

    req.on('close', () => {
        clearInterval(interval);
    });
});

// Admin controls
app.post('/start', (req, res) => {
    timerRunning = true;
    res.send('Timer started');
});

app.post('/pause', (req, res) => {
    timerRunning = false;
    res.send('Timer paused');
});

app.post('/reset', (req, res) => {
    timerValue = parseInt(req.query.time, 10) || 600;
    res.send('Timer reset');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
