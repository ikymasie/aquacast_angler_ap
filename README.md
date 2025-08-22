# AquaCast: Your AI-Powered Fishing Guide

**AquaCast** is a smart fishing forecast application designed to help anglers stop guessing and start catching. By combining real-time environmental data with species-specific AI models, AquaCast provides simple, actionable intelligence to help you find the best time and place to fish for Bream, Bass, and Carp.

Built with Next.js, Firebase, and Google's Genkit, this application is a powerful demonstration of how AI can transform a traditional hobby into a data-driven pursuit.

---
 
## ✨ Key Features

### 🎣 AI-Powered Fishing Forecasts

At the core of AquaCast is a sophisticated scoring engine that translates complex variables into a single, easy-to-understand **Fishing Success Score**.

-   **Species-Aware Intelligence:** Our models are tuned for the unique behaviors of Bream, Bass, and Carp, analyzing weather, pressure, moon phases, and more to give you a tailored forecast.
-   **"Today's Chances" Card:** Get an at-a-glance summary for the current day, including a recommended fishing window, overall score, and a beautiful sun-arc visual that tracks the day's progress.
-   **7-Day Outlook:** Plan your week with detailed 3-hour interval scores and daily summaries for any saved spot.

### 📍 Hyper-Local Spot Intelligence

Go beyond generic forecasts with insights tailored to your exact fishing spots.

-   **Custom Spot Management:** Save your favorite fishing holes using an interactive map. Your spots are saved privately to your account.
-   **AI Casting Advisor:** Receive AI-generated recommendations on exactly *where* to cast (e.g., "Windward Point," "Submerged Vegetation") and *how* to fish your chosen lure, complete with scores and strategic reasoning.
-   **Lure & Condition Analysis:** Get a real-time score (0-10) on how effective your selected lure family (Soft, Crankbait, etc.) will be under the current conditions.

### 🏋️‍♀️ Personalized Practice & Progress Tracking

AquaCast isn't just about finding fish—it's about making you a better angler.

-   **Structured Practice Drills:** Access a catalog of drills designed to improve specific skills like skip casting, pitch accuracy, and retrieve cadence.
-   **Live HUD:** During a drill, a live heads-up display provides real-time feedback on your performance.
-   **AI-Powered Analysis:** After each session, our AI coach provides personalized insights on what you did well, where you can improve, and what to try next.
-   **Skill Mastery & Rankings:** Track your long-term progress with skill radars, mastery levels for different species and bait types, and see how you stack up on the community leaderboard.
-   **Weekly Quests:** Stay engaged with dynamic weekly quests that challenge you to try new techniques and explore different scenarios.

### 📱 Modern, User-Centric Experience

-   **Intuitive Interface:** A clean, mobile-first design makes accessing complex information effortless.
-   **Secure Authentication:** User accounts are managed securely with Firebase Authentication.
-   **Personalized Greetings:** The app welcomes you by name and provides a personalized dashboard.
-   **Community-Funded:** Features a donation system (powered by PayPal) to support the project's continued development.

---

## 🛠️ Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
-   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **Generative AI:** [Genkit](https://firebase.google.com/docs/genkit) (with Google's Gemini models)
-   **Maps:** [Google Maps Platform](https://mapsplatform.google.com/) (Places API, Maps SDK)
-   **Weather Data:** [Open-Meteo API](https://open-meteo.com/)

---

To get started, explore the application by running it locally and navigating to `src/app/page.tsx`. Enjoy your smarter fishing journey!
