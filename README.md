# ⛳ Golf3D – Web Minigolf Game

An interactive **3D Minigolf experience** built with **React + Three.js** and powered by **Firebase (Auth + Firestore)**.  
This project is part of **CloneFest 2025 – Week 3 Challenge**.

---

## 🚀 Tech Stack

- **Frontend:** React (Vite) + Three.js (react-three-fiber)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Auth:** Email/Password & Google Sign-In
- **Hosting:** Firebase Hosting
- **Deployment:** CI/CD with GitHub → Firebase

---

## 📂 Project Structure

src/
├── assets/ # Images, 3D models, textures
├── components/ # UI + 3D components
├── contexts/ # React contexts (Auth, Game, etc.)
├── firebase/ # Firebase config + helpers
├── hooks/ # Custom React hooks
├── pages/ # Pages for routing
├── routes/ # Router setup
├── styles/ # Global CSS / Tailwind
└── main.jsx # Vite entry point

---

## 🔑 Firebase Setup

1. Create Firebase project `Golf3D` and register a web app.
2. Enable **Authentication → Email/Password & Google Sign-In**.
3. Create `.env.local` with the following keys:


VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxx


---

## 🔑 Run Locally

npm install
npm run dev

🎮 Features Roadmap

-- Project setup with Vite + Firebase

-- Landing page with 3D background

-- Firebase Auth (Google + Email/Password)

-- Protected routes (Dashboard)

-- Firestore data handling (player stats, leaderboards)

-- 3D Golf mechanics (ball physics, hole detection)

-- Multiplayer (stretch goal 🤯)

---

## 👨‍💻 Contributors

VTG & Team – RVCE CSE 2025

--- 
