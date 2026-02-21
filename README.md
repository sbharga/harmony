## Project Structure

- `/backend` - FastAPI Python application
- `/frontend` - Vite + React frontend application

---

## 🚀 Backend Setup

The backend uses FastAPI and requires Python. 

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Activate the virtual environment:**
   ```bash
   source venv/bin/activate
   ```
   *(Note: If the `venv` directory does not exist, you can create it first with `python3 -m venv venv`)*

3. **Install the required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend development server:**
   ```bash
   fastapi dev src/main.py
   ```
   *Alternatively, you can run:* `uvicorn src.main:app --reload`

   The backend API will be available at `http://localhost:8000`. 
   You can view the interactive API documentation at `http://localhost:8000/docs`.

---

## 🎨 Frontend Setup

The frontend is built with React and Vite. It requires Node.js and npm.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install the required dependencies:**
   ```bash
   npm install
   ```

3. **Run the frontend development server:**
   ```bash
   npm run dev
   ```

   The frontend will typically be accessible at `http://localhost:5173`. Check your terminal output for the exact URL.