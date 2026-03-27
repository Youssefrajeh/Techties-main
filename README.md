# TechTies - Full-Stack Networking Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-18.x+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

## Overview (Project Overview)

**TechTies** is a full-stack networking platform designed for tech professionals to connect, collaborate, and share skills through intelligent match recommendations.

**Type of Application:** Full-Stack Web Application

---

## Features

- **User Authentication:** Secure login and registration with JWT-based sessions.
- **Profile Management:** Comprehensive onboarding, profile editing, and skill tagging.
- **Match Recommendations:** Intelligent system to suggest connections based on skills.
- **Admin Dashboard:** Centralized management for users, feedback, and platform monitoring.
- **Responsive Design:** Premium UI built with vanilla CSS and modern design principles.

---

## Tech Stack

### Frontend
- **Framework:** React 18+ (Vite)
- **Routing:** React Router DOM v6
- **Styling:** Vanilla CSS (Modular)

### Backend
- **Server:** Node.js & Express
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT & BcryptJS

---

## Project Structure

```text
TechTies/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page-level components (Landing, Dashboard, Admin, etc.)
│   │   └── utils/       # Frontend helpers
│   └── package.json
├── backend/              # Express API
│   ├── models/          # Mongoose schemas (User, Profile, MatchFeedback)
│   ├── routes/          # API endpoints (Auth, Profile, Admin, Match)
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & Error handling
│   └── server.js        # Entry point
└── vercel.json           # Deployment configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Youssefrajeh/Techties.git
   cd Techties
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with MONGODB_URI and JWT_SECRET
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## Demo & Deployment

The project is configured for deployment on **Vercel**. 

- **Frontend URL:** Defaults to port 5173 locally.
- **API URL:** Defaults to port 5000 locally.

---

## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Code Submission Status

The following core features are fully functional and ready for evaluation:
- **Authentication**: Secure Login/Registration with JWT session management.
- **Profile Management**: Profile setup, editing, and skill tagging.
- **Matching System**: Skill-based connection recommendations.
- **Admin Dashboard**: Comprehensive user and feedback management.
- **Responsive UI**: Fully mobile-friendly premium design.

---

## Additional Comments

The project is architected with a strict separation of concerns between the React frontend and the Express/Node.js REST API. This modular approach ensures high maintainability and scalability, meeting all structural requirements for the INFO-3112 submission.

---

## License

Distributed under the MIT License.
