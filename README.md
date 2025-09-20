# ⛳ Golf3D – Web Minigolf Game

An interactive **3D Minigolf experience** built with **React + Three.js** and powered by **Firebase (Auth + Firestore)**.  
This project is part of **CloneFest 2025 – Week 3 Challenge**.

---

## 🚀 Tech Stack

- **Frontend:** React (Vite) + Three.js (react-three-fiber)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Auth:** Email/Password & Google Sign-In
- **Hosting:** Firebase Hosting
- **Deployment:** CI/CD with GitHub → Firebase

---

## 🚀 Features

- 3D environment rendered using **React Three Fiber** & **drei**.
- **Multiple levels** with unique layouts and par scores.
- **Obstacles**:
  - 🌳 Trees
  - 🪨 Rocks
  - 🛢️ Barrels
  - 🏖️ Sand pits (slow the ball down)
  - 🏰 Tunnels (pass through)
  - 🌪️ Windmills (moving blades that knock the ball)
  - Walls / barriers for course design
- Ball physics with **friction, bounce, and gravity**.
- Direction setting system (choose shot direction before hitting).
- Power meter to control shot strength.
- Win condition detection (ball entering the hole).
- End-of-round screen with stars, strokes, and timer.
- Progress saving for multiple levels.

---

## 🛠️ Tech Stack

- **React.js**
- **React Three Fiber** (Three.js bindings for React)
- **@react-three/drei** (helpers for R3F)
- **Three.js** (3D rendering)
- **TailwindCSS** (for UI)
- **React Router** (level navigation)
- **Firebase / LocalStorage** (progress saving)

---

## 🔑 Firebase Setup

1. Create Firebase project Golf3D and register a web app.
2. Enable _Authentication → Email/Password & Google Sign-In_.
3. Create .env.local with the following keys:

VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxx

---

## 📂 Project Structure

3D-Golf-Game/
│
├── .env
├── .firebaserc
├── .gitignore
├── eslint.config.js
├── firebase.json
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── vite.config.js
│
├── public/
│ ├── vite.svg
│
├── src/
│ ├── App.css
│ ├── App.jsx
│ ├── index.css
│ ├── main.jsx
│ │
│ ├── assets/
│ │ ├── react.svg
│ │ └── previews/
│ │ └── level1.jpg
│ │
│ ├── components/
│ │ ├── Dashboard.jsx
│ │ ├── EndOfRound.jsx
│ │ ├── ForgotPassword.jsx
│ │ ├── GolfCourse.jsx
│ │ ├── LandingPage.jsx
│ │ ├── LevelCard.jsx
│ │ ├── Login.jsx
│ │ ├── Navbar.jsx
│ │ ├── ProtectedRoute.jsx
│ │ ├── Signup.jsx
│ │ └── ThreeScene.jsx
│ │
│ ├── contexts/
│ │ └── AuthContext.jsx
│ │
│ ├── firebase/
│ │ ├── firebase.js
│ │ ├── firestorePaths.js
│ │ └── firestoreRefs.js
│ │
│ ├── hooks/
│ │ ├── useAuth.js
│ │ └── useProgress.js
│ │
│ ├── pages/
│ │ ├── Game.jsx
│ │ ├── Home.jsx
│ │ └── LevelSelect.jsx
│ │
│ ├── routes/
│ │ └── AppRouter.jsx
│ │
│ ├── styles/
│ │ └── globals.css
│ │
│ ├── ui/
│ │ ├── MiniCanvas.jsx
│ │ └── ThreeBackground.jsx
│ │
│ └── utils/
│ └── levels.js

---

## 🎮 How to Play

1. **Select a level** from the level selection screen.
2. Press **Set Direction** → Use **← → arrows** to aim.
3. Hold mouse button to **charge power** → release to shoot.
4. Avoid obstacles and try to sink the ball in the hole!
5. Earn stars based on strokes vs par.

---

## ▶️ Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/VTG56/3D-Golf-Game
cd 3D-Golf-Game
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm start
```

The game will be available at `http://localhost:3000`.

---

## 📝 Level Design

- Levels are stored in `/src/utils/levels.js`.
- Each level defines:

```js
{
  id: 1,
  name: "Straight Lane",
  par: 3,
  ballStart: { x: -5, y: 0.25, z: 0 },
  holePosition: { x: 10, y: 0.2, z: 0 },
  holeRadius: 0.3,
  terrain: {
    width: 20,
    height: 10,
    obstacles: [
      { type: "tree", x: 2, z: -1, scale: 1.2 },
      { type: "rock", x: 4, z: 2, scale: 0.8 },
      { type: "windmill", x: 6, z: 0, bladeLength: 2, speed: 1.5 }
    ]
  }
}
```

---

## 🏗️ Future Improvements

- Add more **obstacle types** (ramps, water pits, moving gates).
- Implement **multiplayer support**.
- Add **sound effects & background music**.
- Improve **ball physics** for slopes & ramps.

---

## 📜 License

This project is licensed under the MIT License.  
Feel free to fork and improve the game!

---

Made with ❤️ using React Three Fiber and Three.js
