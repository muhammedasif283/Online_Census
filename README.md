# 🏛️ Kerala Digital Census 2026

> Government of Kerala — Official Digital Census Portal  
> A role-based web application for digital household data collection and administration.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Roles & Credentials](#roles--credentials)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 📖 About the Project

The **Kerala Digital Census 2026** portal is a front-end web application built as a minor academic project. It simulates the digitisation of the household census process for the state of Kerala. The system supports two roles — **Enumerators** (field workers) and **Administrators** — each with their own dedicated dashboard and functionality.

Data is persisted in the browser's `localStorage`, making this a fully self-contained, serverless application.

---

## ✨ Features

### Enumerator
- Secure role-based login (district, taluk, municipality + password)
- Submit household census reports with location, family head info, and living standards
- View, edit, and delete own submitted records
- Real-time search through submitted records
- Live stats: records submitted, total members, wards covered

### Administrator
- Secure admin login (username + password)
- View **all** submitted records across all enumerators
- Search, filter, edit, and delete any record
- Aggregate statistics panel

### General
- Modern glassmorphism UI with smooth animations
- Fully responsive layout
- Accessible markup (ARIA roles, labels, live regions)
- Toast notifications for all user actions

---

## 📁 Project Structure

```
Minor Project/
├── index.html          # Main entry point — Login + Enumerator Dashboard
├── admin.html          # Administrator login redirect page
├── records.html        # Administrator records dashboard
├── css/
│   └── style.css       # Global stylesheet (glassmorphism design system)
└── js/
    ├── app.js          # Shared utilities (localStorage helpers, toast, constants)
    ├── user.js         # Enumerator module (login, form submission, CRUD)
    └── admin.js        # Administrator module (login, records view, CRUD)
```

---

## 🚀 Getting Started

### Prerequisites

No build tools or server required. Just a modern web browser (Chrome, Firefox, Edge).

### Running Locally

1. **Clone or download** the repository:
   ```bash
   git clone https://github.com/your-username/kerala-census-2026.git
   ```

2. **Open** `index.html` directly in your browser:
   ```
   File → Open File → index.html
   ```
   Or simply double-click `index.html` in File Explorer.

> **Note:** Because data is stored in `localStorage`, it is tied to the browser and origin. Use the same browser session for consistent results.

---

## 🖥️ Usage

### Enumerator Flow
1. Open `index.html`.
2. Select the **Enumerator** tab.
3. Choose your assigned district, enter your taluk, municipality, and password.
4. Submit household reports using the form on the dashboard.
5. View, edit, or delete your submitted records below the form.
6. Click **Logout** when done.

### Administrator Flow
1. Open `index.html`.
2. Select the **Administrator** tab.
3. Enter admin credentials.
4. You will be redirected to `records.html` — the full admin dashboard.
5. Browse, search, edit, or delete any record across all enumerators.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic page structure |
| CSS3 (Vanilla) | Glassmorphism UI, animations, responsive grid |
| JavaScript (ES6+) | Application logic, DOM manipulation, localStorage CRUD |
| Google Fonts (Inter) | Modern typography |
| localStorage API | Client-side data persistence |

---

## 🔑 Roles & Credentials

> These are demo credentials for academic/testing purposes only.

| Role | Credential | Value |
|---|---|---|
| Enumerator | Password | `123` *(or as configured in `app.js`)* |
| Administrator | Username | `admin` |
| Administrator | Password | `admin123` *(or as configured in `app.js`)* |

---

## 📸 Screenshots

> *(Add screenshots of the Login page, Enumerator Dashboard, and Admin Records panel here)*

---

## 🤝 Contributing

This is an academic minor project. Contributions, suggestions, and feedback are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is submitted as part of an academic minor project requirement.  
© 2026 — Kerala Digital Census Portal. All rights reserved.

---

*Built with ❤️ for the Government of Kerala Digital Census Initiative.*
