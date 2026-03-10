# 🏫 School Management Portal

A modern, fully frontend **School Management System** built with plain HTML, CSS, and JavaScript.
No backend, no build tools — just open `index.html` in a browser.

---

## 📁 File Structure

| File | Description |
|------|-------------|
| `index.html` | **Login Page** — default landing page |
| `register-teacher.html` | Teacher self-registration |
| `register-principal.html` | Principal self-registration |
| `dashboard-teacher.html` | Teacher dashboard |
| `dashboard-principal.html` | Principal dashboard |
| `dashboard-admin.html` | Admin control panel |
| `style.css` | **Shared stylesheet** (all pages) |
| `app.js` | **Shared JavaScript utilities** (auth, profile, password change) |

---

## 🚀 How to Run

1. Clone or download the repository.
2. Open `index.html` in any modern browser.
3. No server or build step needed.

---

## 🔐 Login Credentials

### Admin (hardcoded)
| Field | Value |
|-------|-------|
| Email | `admin@school.com` |
| Password | `admin123` |

### Teacher / Principal
Register a new account via the **Register as Teacher** or **Register as Principal** links on the login page.

---

## 👥 Roles & Features

### 👤 Admin
- **Cannot** access student academic information
- Grant / deny access to teacher and principal accounts
- View all registered users
- Full role & permission matrix overview

### 📚 Teacher
- Upload homework assignments
- Mark student attendance
- View weekly class schedule
- Track student performance
- Edit profile (name, phone, subject)
- Change password

### 🏛️ Principal
- School reports (department performance, attendance trends)
- Teacher management (view all registered teachers)
- Student records (enrollment overview)
- Post announcements
- Edit profile (name, phone, experience)
- Change password

---

## 💾 Data Storage

All data is persisted in the browser's **localStorage** under two keys:

| Key | Contents |
|-----|----------|
| `sms_users` | Array of registered teacher/principal user objects |
| `sms_current_user` | Currently logged-in user object |

> **Note:** Because data lives in localStorage, it is scoped to the browser/device.
> Clearing browser data will reset all registered accounts.

---

## 🎨 Design

- Font: **Poppins** (Google Fonts)
- Card-based layout with rounded corners and soft shadows
- **Blue / Indigo** theme for Teacher
- **Teal / Green** theme for Principal
- **Slate / Grey** theme for Admin
- Fully responsive (mobile-friendly)
