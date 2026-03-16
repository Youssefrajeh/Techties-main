<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

# TechTies — Build Meaningful Tech Connections

> A modern networking platform that connects tech professionals, helping them discover events, showcase skills, and grow their careers.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Available Scripts](#available-scripts)
- [Demo Credentials](#demo-credentials)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About the Project

**TechTies** is a full-featured, single-page application designed to bridge the gap between tech professionals looking to network, collaborate, and advance their careers. The platform provides an intuitive interface for user onboarding, skill management, profile customization, and a personalized dashboard experience.

---

## Features

| Feature               | Description                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| **Landing Page**      | Eye-catching hero section with feature highlights and call-to-action   |
| **Authentication**    | Email/password login & registration with social OAuth (Google, GitHub) |
| **Protected Routes**  | Route guards ensure only authenticated users access private pages      |
| **Profile Setup**     | Guided onboarding flow for new users after registration                |
| **Profile Editing**   | Update personal details, photo upload, and skill management            |
| **Skill Ranking**     | Interactive skill tagging and proficiency ranking system               |
| **Dashboard**         | Personalized hub displaying user data and activity                     |
| **Responsive Design** | Mobile-first layouts with custom CSS for every component               |

---

## Tech Stack

| Layer          | Technology                                                          |
| -------------- | ------------------------------------------------------------------- |
| **Framework**  | [React 19](https://react.dev/) with JSX                             |
| **Build Tool** | [Vite 7](https://vite.dev/) — lightning-fast HMR & optimized builds |
| **Routing**    | [React Router DOM v7](https://reactrouter.com/)                     |
| **Styling**    | Vanilla CSS (component-scoped stylesheets)                          |
| **Linting**    | [ESLint 9](https://eslint.org/) with React Hooks & Refresh plugins  |
| **Auth**       | Client-side session management via `localStorage` (mock/demo mode)  |

---

## Project Structure

```
Techties02/
├── public/                  # Static assets
│   └── vite.svg
├── src/
│   ├── assets/              # Images and media
│   ├── components/          # Reusable UI components
│   │   ├── Accordion.jsx    #   Collapsible content panels
│   │   ├── Button.jsx       #   Styled button variants
│   │   ├── Card.jsx         #   Content card container
│   │   ├── Input.jsx        #   Form input fields
│   │   ├── Navbar.jsx       #   Navigation bar
│   │   ├── PhotoUpload.jsx  #   Profile photo uploader
│   │   ├── Section.jsx      #   Page section wrapper
│   │   ├── Select.jsx       #   Dropdown select input
│   │   ├── SkillRanking.jsx #   Skill proficiency ranker
│   │   └── SkillsInput.jsx  #   Skill tag input with autocomplete
│   ├── pages/               # Route-level page components
│   │   ├── Landing.jsx      #   Public landing page
│   │   ├── Login.jsx        #   User login page
│   │   ├── Register.jsx     #   User registration page
│   │   ├── ProfileSetup.jsx #   New-user profile onboarding
│   │   ├── ProfileEdit.jsx  #   Edit existing profile
│   │   └── Dashboard.jsx    #   Authenticated user dashboard
│   ├── utils/               # Utility modules
│   │   ├── auth.js          #   Authentication helpers
│   │   └── profileStore.js  #   Profile state management
│   ├── App.jsx              # Root component with routing
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles & design tokens
├── .env                     # Environment variables (git-ignored)
├── .gitignore
├── eslint.config.js
├── index.html               # HTML entry point
├── package.json
├── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x — [Download here](https://nodejs.org/)
- **npm** ≥ 9.x (bundled with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Youssefrajeh/Techties.git
   cd Techties
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the project root (if one doesn't already exist) and add any required environment variables:

```env
# Example
VITE_API_URL=http://localhost:3000/api
```

> **Note:** The `.env` file is excluded from version control via `.gitignore`.

### Running Locally

```bash
npm run dev
```

The development server will start at **http://localhost:5173** with hot module replacement enabled.

---

## Available Scripts

| Command           | Description                                     |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start the Vite development server with HMR      |
| `npm run build`   | Create an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally            |
| `npm run lint`    | Run ESLint across the entire project            |

---

## Demo Credentials

The app ships with pre-seeded demo accounts for testing:

| Email                | Password      |
| -------------------- | ------------- |
| `user@techties.com`  | `password123` |
| `admin@techties.com` | `admin1234`   |

You can also register a new account through the **Sign Up** page.

---

## Contributing

Contributions are welcome! To get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m "Add amazing feature"`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please make sure your code passes linting (`npm run lint`) before submitting.

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## Contact

**Heartware Team**

- GitHub: [github.com/Youssefrajeh/Techties](https://github.com/Youssefrajeh/Techties)

---

<p align="center">
  Built with ❤️ using React + Vite
</p>
