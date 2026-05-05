# Contact Management Dashboard (Angular Version)

A dynamic, single-page contact management application built with **Angular 17**, **TypeScript**, and **Bootstrap 5**.

This project was converted from a Vanilla JS implementation to a modern Angular architecture while maintaining 100% of the original UI and functionality.

---

## 🚀 Features

- **Angular Architecture** — Standalone components, services, and pipes.
- **Contact List** — displays all contacts from the API with avatar, name, job title, and status indicator.
- **Contact Details** — view bio, email addresses (with Primary badge), phone numbers, address, and social links.
- **Real-time Search** — filter by name or phone number.
- **Pagination** — navigate through contacts 10 at a time.
- **Initials Avatars** — colour-coded fallback when no photo is available.
- **Responsive Design** — full mobile support with slide-in detail panel.
- **Unit Tests** — 24 Jasmine/Karma tests covering logic and component behavior.
- **Mock Data Fallback** — gracefully falls back to rich demo data if the API is unreachable.

---

## 🗂️ Project Structure

```
front-end-test/
├── src/
│   ├── app/
│   │   ├── components/       # UI Components (Avatar, List, Details)
│   │   ├── models/           # TypeScript Interfaces
│   │   ├── pipes/            # Data transformation (Initials, Color)
│   │   ├── services/         # API & Data handling
│   │   └── app.component.*   # Root application shell
│   ├── assets/               # Static images
│   ├── styles.scss           # Global styling
│   └── index.html            # Main HTML entry
├── angular.json              # Angular CLI config
├── package.json              # NPM dependencies
└── tsconfig.json             # TypeScript configuration
```

---

## ⚙️ Development

### Setup
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Install dependencies:
   ```bash
   npm install
   ```

### Run Locally
```bash
npm start
```
Then visit **http://localhost:4200**

### Running Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

---

## 🔌 API Configuration

The application uses a mock API backend. You can configure the `API_BASE_URL` in `src/app/services/contact-api.service.ts`.

If the API is unreachable, it falls back to the built-in demo dataset automatically.

---

## 🛠️ Tech Stack

- **Angular 17**
- **TypeScript**
- **Bootstrap 5**
- **Font Awesome 6**
- **RxJS**
- **Jasmine/Karma**
