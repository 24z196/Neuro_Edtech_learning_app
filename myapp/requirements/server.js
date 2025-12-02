// 1. Import necessary packages
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// --- NEW IMPORT for CORS ---
const cors = require('cors'); 

// --- Load .env file ---
require('dotenv').config();

// 2. Create an Express app
const app = express();
app.use(express.json());
const port = 3000;
const saltRounds = 10;

// 3. Secret Keys
const JWT_SECRET = process.env.JWT_SECRET;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

// --- Check if keys are loaded ---
if (!JWT_SECRET || !GEMINI_API_KEY) {
    console.error('FATAL ERROR: JWT_SECRET or GEMINI_API_KEY is not defined in .env file');
    process.exit(1); 
}

// --- Enable CORS for FastAPI and Frontend ---
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000', '*'], // Adjust origins as needed
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


// 4. Database connection details
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'neuroEdTechDB';

// 7. Authentication Middleware (Checks for a valid JWT)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).send({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// 8. Create an async function to start the server
async function startServer() {
    try {
        // 9. Connect to the database
        await client.connect();
        console.log('Connected successfully to MongoDB');
        
        // 10. Define all collections
        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        const chatCollection = db.collection('chatHistory');
        const statsCollection = db.collection('dashboardStats');

        // --- 11. AUTHENTICATION ROUTES (Public) ---

        app.post('/signup', async (req, res) => {
            try {
                const { username, password } = req.body;
                
                if (await usersCollection.findOne({ username: username })) {
                    return res.status(409).send({ message: 'Username already exists' });
                }
                
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                const newUser = { username, password: hashedPassword };
                
                const result = await usersCollection.insertOne(newUser);
                
                const tokenPayload = { id: result.insertedId.toString(), username: username };
                const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });
                
                res.status(201).send({ message: 'User created successfully!', token: token });
            } catch (error) {
                console.error('Error during signup:', error);
                res.status(500).send({ message: 'Error creating user' }); 
            }
        });

        app.post('/login', async (req, res) => {
            try {
                const { username, password } = req.body;
                const user = await usersCollection.findOne({ username: username });

                if (user && await bcrypt.compare(password, user.password)) {
                    const tokenPayload = { id: user._id.toString(), username: user.username };
                    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

                    res.status(200).send({ message: 'Login successful!', token: token });
                } else {
                    res.status(401).send({ message: 'Invalid username or password' });
                }
            } catch (error) {
                console.error('Error during login:', error);
                res.status(500).send({ message: 'Error logging in' });
            }
        });

        // --- 12. SECURED DATA ROUTES ---
        
        app.post('/save-chat', authenticateToken, async (req, res) => {
            try {
                const userId = req.user.id; 
                const { message, sender } = req.body; 
                
                const chatMessage = {
                    userId: new ObjectId(userId), 
                    message: message,
                    sender: sender,
                    timestamp: new Date()
                };
                const result = await chatCollection.insertOne(chatMessage);
                res.status(201).send({ message: 'Chat saved', chatMessageId: result.insertedId });
            } catch (error) {
                console.error('Error saving chat:', error);
                res.status(500).send({ message: 'Error saving chat' });
            }
        });

        app.get('/get-chat', authenticateToken, async (req, res) => {
            try {
                const userId = req.user.id;
                const messages = await chatCollection.find({ userId: new ObjectId(userId) }).sort({ timestamp: 1 }).toArray();
                res.status(200).send(messages);
            } catch (error) {
                console.error('Error getting chat:', error);
                res.status(500).send({ message: 'Error getting chat history' });
            }
        });

        // --- UPDATED ROUTE for Frontend Cognitive State Logging ---
        app.post('/update-stats', authenticateToken, async (req, res) => {
            try {
                const userId = req.user.id;
                // currentState and timestamp are logged by NeuroAdaptiveController.js
                const { currentState, timestamp } = req.body; 
                
                if (!currentState || !timestamp) {
                     return res.status(400).send({ message: 'Missing currentState or timestamp' });
                }
                
                const newLog = {
                    state: currentState,
                    loggedAt: new Date(timestamp), // Use the timestamp sent from the client
                };
                
                // Update the user's dashboard stats (e.g., total sessions, last state)
                await statsCollection.updateOne(
                    { userId: new ObjectId(userId) },
                    { 
                        // $set updates fields like 'lastLoggedState'
                        $set: { 
                            lastLoggedState: currentState, 
                            lastLoggedAt: new Date(timestamp),
                        }, 
                        // $push adds the state log to an array for detailed history/dashboard
                        $push: { 
                            stateHistory: newLog 
                        },
                        // $inc increments the session count (can be refined to track true sessions)
                        $inc: { 
                            totalStateLogs: 1 // Track total logs for analysis
                        } 
                    }, 
                    { upsert: true }
                );
                
                res.status(200).send({ message: 'Stats updated', loggedState: currentState });
            } catch (error) {
                console.error('Error updating stats:', error);
                res.status(500).send({ message: 'Error updating stats' });
            }
        });
        
        // --- ADDED ROUTE to retrieve state logs for the Dashboard (Conceptual) ---
        app.get('/get-stats', authenticateToken, async (req, res) => {
            try {
                const userId = req.user.id;
                // Retrieve all state history for a user's dashboard
                const stats = await statsCollection.findOne(
                    { userId: new ObjectId(userId) },
                    { projection: { stateHistory: 1, lastLoggedState: 1, totalStateLogs: 1 } } // Only return relevant fields
                );
                
                if (!stats) return res.status(404).send({ message: 'No stats found for user' });
                res.status(200).send(stats);
            } catch (error) {
                console.error('Error getting stats:', error);
                res.status(500).send({ message: 'Error getting stats' });
            }
        });
        
        // --- 13. Start the server ---
        app.listen(port, () => {
            console.log(`Express Server running at http://localhost:${port}/`);
        });

    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); 
    }
}

// 14. Call the function to start the server
startServer();