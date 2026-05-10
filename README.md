# ✈️ Traveloop

**Traveloop** is an intelligent, modern, and collaborative web application designed to simplify the complex process of multi-city travel planning. Built with a sleek, glassmorphic UI and powerful AI integrations, Traveloop empowers users to dream, design, and organize their global itineraries with ease.

![Traveloop Dashboard Demo](https://via.placeholder.com/1000x500.png?text=Traveloop+Dashboard)

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

---

## 🚀 How to Run Locally

To get the application running on your local machine, you will need to open **two separate terminal windows**.

### 1. Initial Setup
First, clone the repository and install the dependencies:
```bash
git clone https://github.com/dcodes0/odoo-travelloop.git
cd odoo-travelloop
npm install
```

Create a `.env.local` file in the root directory and add the required environment variables:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-32-character-ultra-secure-secret-key-goes-here!!"
GROQ_API_KEY="your_groq_api_key"
```

Sync the database schema:
```bash
npx prisma db push
```

### 2. Run the Next.js Application Server
In your **first terminal window**, start the Next.js development server:
```bash
npm run dev
```
The application will now be running on [http://localhost:3000](http://localhost:3000).

### 3. Run the Prisma Studio Database Manager
In your **second terminal window**, start the Prisma Studio visual database editor:
```bash
npx prisma studio
```
The database manager will now be running on [http://localhost:5555](http://localhost:5555). 

> **Tip:** You can use Prisma Studio to instantly grant yourself administrative privileges! Simply find your user record, change the `role` field from `"USER"` to `"ADMIN"`, save the change, and log back into Traveloop to access the secret Admin Dashboard.

---

## 🛡️ Security & Privacy
Traveloop utilizes robust stateless cookie sessions via `iron-session`. All user passwords are encrypted using `bcryptjs` with a high salt round before ever reaching the database. Admin API endpoints are strictly protected by server-side middleware and role-checking validations.

## 🤝 Contributing
Traveloop was built during a high-octane hackathon sprint! We welcome pull requests, issues, and feature suggestions to help us continue making travel planning effortless.
