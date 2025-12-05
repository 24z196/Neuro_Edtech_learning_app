# 🌐 Neuro EdTech Learning App  
An adaptive, full-stack learning platform that personalizes educational content based on real-time cognitive states — **Attention**, **Calm**, and **Drowsy**.

This system integrates a responsive React + TypeScript frontend, Node.js backend, JavaScript machine-learning engine, and a Python AI chatbot to create an immersive learning experience.

---

## 🚀 Features

### 🧠 Cognitive State Adaptation  
- Detects **Attention**, **Calm**, and **Drowsy** cognitive states  
- Automatically adjusts UI and learning content  
- Supports real-time cognitive state updates  

### 🤖 AI Chatbot  
- Python-based chatbot with custom APIs  
- Avatar-enhanced interaction  
- Provides contextual guidance and learning assistance  

### 🎓 Learning Zone  
- Built with **React**, **TypeScript**, and **TailwindCSS**  
- Interactive learning modules  
- UI dynamically adapts based on user state  

### 📊 Machine Learning  
- Softmax-based classification implemented in JavaScript  
- Balanced dataset training scripts  
- Real-time inference server for cognitive state predictions  

### 🛠 Backend API  
- Node.js backend bridging ML, chatbot, and frontend  
- Modular, extendable API structure  

---

## 📁 Folder Structure

```text
myapp/
├── CHATBOT___/      # Python chatbot APIs
├── Frontend/        # React + TypeScript UI
├── ML/              # Machine learning models and server
└── backend/         # Node.js backend
```

---

## ⚙️ Setup Instructions

### **Frontend**
```bash
cd myapp/Frontend
npm install
npm run dev
```

### **Backend**
```bash
cd myapp/backend
npm install
node index.js
```

### **Machine Learning Server**
```bash
cd myapp/ML
npm install
node ml_server.js
```

### **Chatbot**
```bash
cd myapp/CHATBOT___
pip install -r requirements.txt
python chat_api.py
```

---

## ▶️ Usage

1. Start **all modules**:  
   - Frontend  
   - Backend  
   - ML Server  
   - Chatbot  

2. Open the frontend in your browser.  
3. Select (or automatically detect) a cognitive state.  
4. Enter the learning zone and interact with the AI chatbot.  
5. The system adapts UI components and content based on your cognitive state.

---

## 📜 License  
This project is licensed under the **MIT License**.
