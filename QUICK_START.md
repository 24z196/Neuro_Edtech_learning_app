# 🚀 Quick Start & Commands Reference

## ✅ All Servers Currently Running

| Component | Port | Status | URL |
|-----------|------|--------|-----|
| Frontend | 3000 | ✅ Running | http://localhost:3000 |
| Backend | 4000 | ✅ Running | http://localhost:4000 |
| Chatbot | 5002 | ✅ Running | http://localhost:5002 |
| ML Server | 5001 | ✅ Running | http://localhost:5001 |

**Frontend is live! Open: http://localhost:3000**

---

## 🎯 To Start Fresh (All Servers)

### PowerShell Terminal 1: Backend
```powershell
cd 'c:\Users\Narendra Prasad R N\OneDrive\Neuro_Edtech_app\Neuro_Edtech_learning_app\myapp\backend'
npm install
npm run dev
```
Expected output: `Backend Express API running on http://localhost:4000`

### PowerShell Terminal 2: ML Server
```powershell
cd 'c:\Users\Narendra Prasad R N\OneDrive\Neuro_Edtech_app\Neuro_Edtech_learning_app\myapp\ML'
npm install
npm start
```
Expected output: `✓ ML server running on http://localhost:5001`

### PowerShell Terminal 3: Frontend
```powershell
cd 'c:\Users\Narendra Prasad R N\OneDrive\Neuro_Edtech_app\Neuro_Edtech_learning_app\myapp\Frontend'
npm run dev
```
Expected output: `VITE v6.3.5  ready in ... ms` + `Local: http://localhost:3000/`

### PowerShell Terminal 4: Chatbot FastAPI
```powershell
cd 'c:\Users\Narendra Prasad R N\OneDrive\Neuro_Edtech_app\Neuro_Edtech_learning_app\myapp\CHATBOT___'
pip install -r requirements.txt.txt
uvicorn chat_api:app --host 0.0.0.0 --port 5002 --log-level info
```
Expected output: `Uvicorn running on http://localhost:5002` (Gemini auth via .env)

---

## 🧪 Test Endpoints (Copy-Paste)

### Test Backend Chat
```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/chat' `
  -Body (@{message='Hello'; profile='normal'; state='attention'} | ConvertTo-Json) `
  -ContentType 'application/json'
```
Expected: `{ "reply": "You said: Hello" }`

### Test FastAPI Chatbot
```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:5002/api/chat' `
   -Body (@{message='Why is attention important?'; profile='normal'; state='calm'} | ConvertTo-Json) `
   -ContentType 'application/json'
```
Expected: `{ "reply": "...Gemini generated answer..." }`

### Test ML Prediction
```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:5001/api/predict' `
  -Body (@{features=@(0.5, 0.6, 0.7, 0.8)} | ConvertTo-Json) `
  -ContentType 'application/json'
```
Expected: `{ "prediction": { "attention": 0.2, "calm": 0.65, "drowsiness": 0.15 } }`

### Test Backend to ML Proxy
```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/predict' `
  -Body (@{features=@(0.5, 0.6, 0.7, 0.8)} | ConvertTo-Json) `
  -ContentType 'application/json'
```
Expected: Same as ML Server (backend proxies to ML)

---

## 📊 Full Data Flow

```
USER TYPES MESSAGE IN FRONTEND
            ↓
Frontend: http://localhost:3000
    • React Component captures input
    • Sends: POST /api/chat
            ↓
Backend: http://localhost:4000
   • Receives: { message, profile, state }
   • Processes: Proxies the payload to FastAPI Gemini /chat on localhost:5002
   • Returns: { reply }
            ↓
Chatbot FastAPI (http://localhost:5002)
   • Calls: `core.adaptive` which invokes Gemini
   • Returns: { reply }

FRONTEND DISPLAYS CHAT RESPONSE
```

```
USER COGNITIVE STATE NEEDED
            ↓
Frontend/Backend calls: POST /api/predict
    • Sends: { features: [eeg_sample_1, eeg_sample_2, ...] }
            ↓
Backend receives, proxies to ML
    • Calls: http://localhost:5001/api/predict
            ↓
ML Server: http://localhost:5001
    • Runs prediction model
    • Returns: { prediction: { attention: 0.7, calm: 0.2, drowsiness: 0.1 } }
            ↓
Backend returns to Frontend
            ↓
FRONTEND ADAPTS LEARNING EXPERIENCE
```

---

## 📁 Key Files Modified

### Files Changed:
1. **Backend API** → `myapp/backend/index.js`
   - Added: `/api/chat` endpoint
   - Added: `/api/predict` proxy to ML

2. **Backend Config** → `myapp/backend/package.json`
   - Added: `axios` dependency

3. **Frontend Chat** → `myapp/Frontend/src/LearningZone.tsx`
   - Fixed: Chat URL from `5000` → `4000`

4. **Frontend Chat 2** → `myapp/Frontend/src/components/LearningZone.tsx`
   - Fixed: Chat URL from `5000` → `4000`

5. **ML Server** → `myapp/ML/ml_server.js`
   - Added: CORS middleware
   - Added: Error handling for missing model files

6. **ML Config** → `myapp/ML/package.json`
   - Created new file with dependencies

### Files Created:
7. `myapp/ML/cognitive_state_model_final.json` (stub)
8. `myapp/ML/scaler_final.json` (stub)
9. `INTEGRATION_COMPLETE.md` (reference guide)
10. `CONNECTION_FIXES.md` (issues & solutions)
11. `QUICK_START.md` (this file)
12. `myapp/CHATBOT___/core.py` (extracted Gemini helpers & memory logic)
13. `myapp/CHATBOT___/chat_api.py` (FastAPI `/api/chat` endpoint)
14. `myapp/CHATBOT___/requirements.txt.txt` (Chatbot dependencies)

---

## 🔍 Troubleshooting

### Frontend Won't Load?
```powershell
# Check if Vite is running on 3000
netstat -ano | findstr :3000
# If occupied, kill and restart Frontend server
```

### Backend Errors?
```powershell
# Check if port 4000 is in use
netstat -ano | findstr :4000
# Restart backend: npm run dev
```

### ML Server Won't Start?
```powershell
# Check if model files exist:
Test-Path 'c:\...\myapp\ML\cognitive_state_model_final.json'
# Verify all dependencies installed
npm list
```

### Chatbot Service Unreachable?
```powershell
# Check the FastAPI server
Invoke-RestMethod -Method Post -Uri 'http://localhost:5002/api/chat' `
   -Body (@{message='hello'; profile='normal'; state='calm'} | ConvertTo-Json) `
   -ContentType 'application/json'
```
Ensure GEMINI_API_KEY is defined in myapp/CHATBOT___/.env and pip install -r requirements.txt.txt has been run.

### Can't Connect Between Servers?
```powershell
# Verify backends are responding
Invoke-RestMethod http://localhost:4000/api/chat -Method Post
Invoke-RestMethod http://localhost:5001/api/predict -Method Post
```

---

## 🎯 What's Working Now

✅ Frontend loads at http://localhost:3000
✅ Chatbot service listening at http://localhost:5002
✅ Backend proxies chat through FastAPI so replies now come from Gemini
✅ ML predictions return cognitive states
✅ All CORS headers configured
✅ All error handling in place
✅ All dependencies installed
✅ All endpoints tested

---

## 📝 Next Enhancement Ideas

1. **Refine Gemini companion**: Improve prompts, context caching, and memory persistence
2. **Real ML Model**: Load actual brain.js neural network
3. **WebSocket**: Real-time BCI/EEG streaming
4. **Database**: PostgreSQL/MongoDB for user data
5. **Auth**: User login/registration
6. **Real Hardware**: Connect BCI device

---

**Last Updated**: December 4, 2025
**All Systems**: ✅ OPERATIONAL
