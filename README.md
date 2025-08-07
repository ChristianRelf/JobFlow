# JobFlow

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR_NETLIFY_BADGE_ID/deploy-status)](https://app.netlify.com/sites/boisterous-duckanoo-7ceb28/deploys)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![Discord OAuth](https://img.shields.io/badge/Auth-Discord%20OAuth-5865F2?logo=discord)](https://discord.com/developers/docs/topics/oauth2)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Oakridge Education Center

**Oakridge Education Center** is a web-based learning hub for the Roblox community, centered on the **Oakridge Nuclear Power Station**. This app offers educational content, interactive features, and secure login through Discord to connect and inform players.

---

## 🔧 Tech Stack

- ⚛️ **React** — Modern frontend library
- 🧰 **Supabase** — Realtime backend and authentication
- 🌍 **Netlify** — Hosting and CI/CD
- 🛡️ **Discord OAuth** — Social login and identity

---

## ✨ Features

- 📚 Learn about Oakridge Nuclear Power Station on Roblox
- 🧑‍🤝‍🧑 Community-based education and access
- 🔐 Secure Discord login via OAuth2
- 📡 Realtime data from Supabase
- 🚀 Fast and free deployment on Netlify

---

## 🛠️ Getting Started

### Prerequisites

- Node.js and npm
- Supabase account + project
- Discord Developer App

### 📦 Installation

```bash```
```git clone https://github.com/yourusername/oakridge-education-center.git```
```cd oakridge-education-center```
```npm install```

### ⚙️ Environment Variables
Create a `.env` file in the root directory:

`VITE_SUPABASE_URL=your_supabase_url`
`VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`
`VITE_DISCORD_CLIENT_ID=your_discord_client_id`
`VITE_DISCORD_REDIRECT_URI=your_redirect_uri`

### 🚀 Run the App

`npm run dev`
Open http://localhost:5173 to view it in your browser.

### 📁 Project Structure
oakridge-education-center/
├── public/
├── src/
│   ├── components/      # Reusable UI elements
│   ├── pages/           # Main routes
│   ├── auth/            # Discord login logic
│   ├── utils/           # Helper functions
│   └── App.jsx
├── .env
├── package.json
└── README.md

### 🤝 Contributing
We welcome contributions from the community!
To contribute:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/your-feature)
3. Commit your changes
4. Push to the branch (git push origin feature/your-feature)
5. Open a Pull Request



