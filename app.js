const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

// Set your OpenAI API key
const apiKey = 'sk-proj-WwG1mPWhNBEPwBFkkOzFT3BlbkFJwRj4mT17Yh0nCQefYsiZ'; // Replace with your actual OpenAI API key
const apiUrl = 'https://api.openai.com/v1/chat/completions';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send(`
        <!doctype html>
        <html>
        <head>
            <title>Quiz Generator</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }
                h1 {
                    color: #333;
                }
                form {
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    width: 300px;
                    text-align: center;
                }
                label {
                    display: block;
                    margin-bottom: 10px;
                    color: #666;
                }
                input[type="text"] {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 20px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    background-color: #007BFF;
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                button:hover {
                    background-color: #0056b3;
                }
                #quiz {
                    margin-top: 20px;
                    width: 300px;
                    background: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
            </style>
        </head>
        <body>
            <h1>Generate a Quiz</h1>
            <form id="quiz-form">
                <label for="topic">Enter a topic:</label>
                <input type="text" id="topic" name="topic" required>
                <button type="submit">Generate Quiz</button>
            </form>
            <div id="quiz"></div>
            <script>
                document.querySelector('#quiz-form').addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const topic = document.querySelector('#topic').value;
                    const response = await fetch('/generate_quiz', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ topic }),
                    });
                    const data = await response.json();
                    const quizDiv = document.querySelector('#quiz');
                    quizDiv.innerHTML = '<h2>Quiz</h2>';
                    data.quiz.forEach((question, index) => {
                        quizDiv.innerHTML += \`<p>\${index + 1}. \${question}</p>\`;
                    });
                });
            </script>
        </body>
        </html>
    `);
});

app.post('/generate_quiz', async (req, res) => {
    const topic = req.body.topic;

    const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `Generate a 5-question multiple-choice quiz on the topic of ${topic}.` }
    ];

    try {
        const response = await axios.post(
            apiUrl,
            {
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 300,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
            }
        );

        const quiz = response.data.choices[0].message.content.trim().split('\n').filter(line => line);

        res.json({ quiz });
    } catch (error) {
        console.error('Error generating quiz:', error.response ? error.response.data : error.message);
        res.status(500).send('Error generating quiz');
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
