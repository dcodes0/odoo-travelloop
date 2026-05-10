# ✈️ Traveloop

**Traveloop** is an intelligent, modern, and collaborative web application designed to simplify the complex process of multi-city travel planning. Built with a sleek, glassmorphic UI and powerful AI integrations, Traveloop empowers users to dream, design, and organize their global itineraries with ease.


## 🌟 Vision & Features

Our mission is to eliminate the stress of planning vacations by centralizing everything you need in one intuitive platform:

- **🗺️ Interactive Itinerary Builder**: Add cities, manage travel dates, and drag-and-drop activities to craft the perfect multi-stop journey.
- **✨ AI-Powered Suggestions**: Integrated with **Groq AI (Llama 3)**, Traveloop automatically suggests intelligent activities and stops based on your trip's unique context.
- **💰 Smart Budgeting**: Instantly track your estimated costs and calculate average daily budgets dynamically as you add activities to your itinerary.
- **🛡️ Secure Admin Dashboard**: A fully protected analytics suite with Recharts visualizations, tracking platform usage, popular destinations, and user engagement.
- **🔗 Public Sharing**: Generate beautiful, read-only public links to share your planned itineraries with friends, family, or social media.

## 💻 Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Vanilla CSS (Custom Glassmorphism Design System), Recharts
- **Backend**: Next.js Server API Routes, Server Components
- **Database**: Prisma v6 ORM, SQLite
- **Authentication**: Custom Iron-Session implementation with bcrypt password hashing
- **AI Integration**: Groq API (llama-3.3-70b-versatile)

## 🛡️ Security & Privacy
Traveloop utilizes robust stateless cookie sessions via `iron-session`. All user passwords are encrypted using `bcryptjs` with a high salt round before ever reaching the database. Admin API endpoints are strictly protected by server-side middleware and role-checking validations.

## 🤝 Contributing
Traveloop was built during a high-octane hackathon sprint! We welcome pull requests, issues, and feature suggestions to help us continue making travel planning effortless.
