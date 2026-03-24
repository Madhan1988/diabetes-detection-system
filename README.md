# 🩺 Diabetes Detection System

A full-stack MERN application with integrated Machine Learning for diabetes risk prediction.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS        |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB + Mongoose                  |
| ML Service  | Python, Flask, scikit-learn         |
| Auth        | JWT + bcrypt                        |

## Project Structure

```
diabetes-detection/
├── backend/          # Node.js + Express REST API
├── frontend/         # React 18 + Vite UI
├── ml-service/       # Python Flask ML microservice
└── docker-compose.yml
```

## Quick Start

### 1. ML Service (Python)
```bash
cd ml-service
pip install -r requirements.txt
python train_model.py       # Train & save model
python app.py               # Start Flask on :5001
```

### 2. Backend (Node)
```bash
cd backend
cp .env.example .env        # Fill in your values
npm install
npm run dev                 # Start Express on :5000
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev                 # Start Vite on :5173
```

## ML Model

- **Algorithm**: Random Forest Classifier (+ Logistic Regression fallback)
- **Dataset**: Pima Indians Diabetes Dataset (768 samples, 8 features)
- **Features**: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age
- **Accuracy**: ~78–82%

## API Endpoints

### Auth
| Method | Route               | Description          |
|--------|---------------------|----------------------|
| POST   | /api/auth/register  | Register new user    |
| POST   | /api/auth/login     | Login & get JWT      |
| GET    | /api/auth/me        | Get current user     |

### Predictions
| Method | Route                    | Description              |
|--------|--------------------------|--------------------------|
| POST   | /api/predict             | Submit health data       |
| GET    | /api/predict/history     | Get prediction history   |
| GET    | /api/predict/:id         | Get single prediction    |

### ML Service (internal)
| Method | Route        | Description       |
|--------|--------------|-------------------|
| POST   | /predict     | Raw ML prediction |
| GET    | /health      | Service health    |
