# LocalConnect - Kerala Tourism Platform

Connect tourists with local guides across Kerala.

---

## Folder Structure

```
LocalConnect/
├── server.js              ← Express backend (all API routes)
├── package.json           ← Dependencies
├── database/
│   └── db.js              ← SQLite database + seed data
├── public/
│   ├── index.html         ← Single page app entry
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── tourist.js
│   │   ├── guide.js
│   │   ├── admin.js
│   │   └── app.js
│   └── uploads/           ← Profile images (auto-created)
└── database/
    └── localconnect.db    ← SQLite file (auto-created)
```

---

## Setup

### 1. Open terminal in this folder

### 2. Install dependencies
npm install

### 3. Start the server
npm start

(or: npm run dev  for auto-reload)

### 4. Open browser
http://localhost:3000

---

## Default Login

| Role  | Email                  | Password |
|-------|------------------------|----------|
| Admin | admin@localconnect.com | admin123 |

---

## User Flows

TOURIST
- Register → Dashboard → Set up Profile
- Explore Places → Book Guide → Choose Package → Pay after acceptance

GUIDE (enrolled from tourist)
- Tourist applies via Enrolment tab
- Admin approves → user logs out/in → Guide Dashboard
- Set up profile → add packages → accept/reject requests → view revenue

ADMIN
- Login → analytics dashboard
- Review guide applications → approve/reject
- Manage all users and guides
