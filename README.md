# NutriScan Clinical

**A hospital diet monitoring system that turns meal photos into clinical nutrition data.**

Built in **24 hours** by a team of 5 at the **UM National Deep Tech Challenge** — Universiti Malaya's flagship deep-tech startup accelerator program.

![NutriScan Dietitian Dashboard](docs/screenshots/04-dietitian-dashboard.png)

---

## The Problem

In Malaysian hospitals, dietitians and nurses still track patient nutrition by hand — clipboards, paper forms, eyeballed estimates of how much food a patient actually ate. The result: inconsistent records, delayed alerts when patients aren't eating enough, and hours of administrative work that should be clinical care.

## The Solution

NutriScan Clinical replaces that workflow with a photo-driven, role-based web app:

1. **Nurse** snaps a *before* and *after* photo of the patient's meal tray.
2. The system analyzes both photos with OpenAI vision + a curated food database, and computes actual intake — kcal, carbs, protein, fat.
3. If a patient ate less than 50% (Low) or 25% (Critical), an alert is automatically raised to the **Dietitian**.
4. **Admin** manages users, the bilingual food database (Nasi Lemak, Ayam Masak Merah, Ikan Siakap Stim — English + Bahasa Melayu), and ward-level configuration.

---

## Features

### Role-Based Access
- **Nurse Panel** — Per-ward patient list, breakfast/lunch/dinner meal logging with photo capture
- **Dietitian Panel** — Monitoring dashboard, real-time alerts queue, patient intake history, PDF reports
- **Admin Panel** — User management, food database CRUD, nurses tab, ward configuration

### Clinical Workflow
- Before/after meal photos with automatic intake percentage calculation
- Five diet types: **Diabetic**, **Low Sodium**, **Renal**, **Post-Surgery**, **Regular**
- Two-tier automatic alerts: **Critical** (<25% intake) and **Low** (<50% intake)
- Per-patient daily kcal targets
- Dietitian intervention notes attached to patients
- Multi-ward support (3A, 3B, ...)

### Reporting & Analytics
- Patient intake history with charts (Recharts)
- Ward overview reports
- PDF export for clinical records (jsPDF)
- Bulk delete for reports and alerts management

---

## Screenshots

### Login & Demo Accounts
![Login Page](docs/screenshots/01-login.png)

### Nurse Panel — Ward 3B Patient List
![Nurse Panel](docs/screenshots/02-nurse-panel.png)

### Admin — Bilingual Food Database
![Food Database](docs/screenshots/03-admin-food-database.png)

### Dietitian — Monitoring Dashboard
![Dietitian Dashboard](docs/screenshots/04-dietitian-dashboard.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 14.2** (App Router) |
| Language | **TypeScript** |
| Database | **PostgreSQL** + **Prisma 5** ORM |
| Auth | **NextAuth.js** + bcryptjs |
| AI | **OpenAI API** (meal photo vision analysis) |
| Styling | **Tailwind CSS** |
| Charts | **Recharts** |
| PDF Export | **jsPDF** + jspdf-autotable |

### Data Model (9 Prisma models)
`User` · `Patient` · `MealLog` · `MealPhoto` · `MealFoodItem` · `FoodItem` · `NutritionResult` · `Alert` · `Intervention`

---

## The Build

Built in a single 24-hour sprint by a team of 5 at the **UM Deep Tech Startup Accelerator Programme**, Universiti Malaya.

### During the hackathon — heads down, building.
![Team during the build](docs/screenshots/05-team-hackathon.jpg)

### Presentation day.
![Team presenting at UM Deep Tech](docs/screenshots/06-team-presentation.jpg)

![Presenter](docs/screenshots/07-presenter-solo.jpg)

---

## Getting Started

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** database
- **OpenAI API key**

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/muazramzii/nutriscan-clinical.git
   cd nutriscan-clinical
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   NEXTAUTH_SECRET="your-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   OPENAI_API_KEY="sk-..."
   ```

4. Run migrations and seed demo data:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts

After running the seed, you can sign in with:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@nutriscan.my` | `admin123` |
| Dietitian | `dietitian@nutriscan.my` | `dietitian123` |
| Nurse (Ward 3B) | `nurse@nutriscan.my` | `nurse123` |

---

## Project Structure

```
nutriscan-clinical/
├── prisma/
│   ├── schema.prisma        # 9 models — clinical data layer
│   ├── migrations/
│   └── seed.ts              # Demo data: 8 patients, 15 food items, 3 users
├── src/
│   ├── app/
│   │   ├── admin/           # Admin panel routes
│   │   ├── dietitian/       # Dietitian panel routes
│   │   ├── nurse/           # Nurse panel routes
│   │   ├── login/           # Auth pages
│   │   └── api/
│   │       └── analyze-food/  # OpenAI vision endpoint
│   ├── components/          # Shared UI components
│   ├── lib/
│   │   └── openai.ts        # OpenAI client
│   ├── types/
│   └── middleware.ts        # Route protection
├── public/uploads/          # Meal photo storage
└── docs/screenshots/        # Portfolio screenshots
```

---

## Team

Built by a team of **5** at the **UM National Deep Tech Challenge**, Universiti Malaya.

---

*A hackathon prototype demonstrating photo-driven clinical workflows for Malaysian hospital nutrition tracking.*
