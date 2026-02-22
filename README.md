## Project Structure

- `/backend` - FastAPI Python application
- `/frontend` - Vite + React frontend application

## Inspiration
This started because organizing dorm rooms can be brutal. I kept rearranging furniture in a cramped space, and every time I’d finish, I’d realize the layout still felt off… after doing all the lifting. I wanted a faster way to know what would work before committing.
## What it does
Harmony takes two aligned photos (one eye-level, one floor-level) and turns them into a room layout you can actually see in 3D. Gemini spits out a simple JSON layout (what the objects are, where they go, and which way they face). Claude then cleans it up and converts it into our format. From there, we render the room in the browser using React Three Fiber and our furniture assets. You also get a “harmony” score that checks things like how easy it is to walk around, whether the space feels open, and if furniture placement makes sense. The heatmap makes it super obvious where things are tight or blocked. And if the layout isn’t great, you can hit “Optimize Harmony” to automatically improve it.
## How we built it
Gemini handles the first pass from the photos. Claude normalizes the JSON so it matches our schema and furniture presets. The frontend is Vite + React + Three.js/R3F. Our furniture components have fixed real-world sizes, so everything stays scaled correctly. The scoring runs grid-based checks for reachability and blocked zones, and the optimizer tries different placements/rotations while avoiding overlaps and keeping enough walking space.
## Challenges we ran into
Depth is tricky to read from one photo for AI, so we require two views. LLM outputs can also be inconsistent, so we had to be strict about schemas and allowed object types. Early on, our pathing and collision checks were kind of fragile, so we added stronger clearance rules and fixed a few grid mutation bugs. We also had to keep the 3D renderer lightweight so it stays smooth in-browser.
## Accomplishments that we're proud of
We got the full pipeline working: photos → JSON → cleaned schema → 3D room. The harmony score usually lines up with what a person would call “good flow.” The heatmap makes problems obvious instantly. And the optimizer actually improves layouts in a meaningful way instead of doing random shuffles.
## What we learned
Honestly, the biggest lesson was that constraints matter a lot. Fixed furniture presets, simple rotation rules, and “no sizes” made the outputs way more stable. Also, AI works best here when it’s paired with hard geometry checks instead of trying to let the model do everything.
## What's next for Harmony
Two main things:
Tune prompts/models to cut down on weird hallucinated variants and speed up responses.
Add multi-door + window awareness so traffic flow and walkway suggestions feel way more realistic.

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
