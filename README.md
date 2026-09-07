# સ્વાદિષ્ટEats — Food Ordering Startup

> **Local food. Real prices. No drama.**  
> A fair food delivery platform for Tier 2 & 3 cities — starting from Mahuva, Gujarat.

---

## 📁 Project Structure

```
New Startup - Mahuva/
├── frontend/               ← Interactive UI Dashboards
│   ├── index.html          ← Landing page
│   ├── customer-dashboard.html ← Customer food ordering app
│   ├── restaurant-dashboard.html ← Admin/Sales Analytics dashboard
│   ├── css/                ← Modern dark-theme design system
│   └── js/                 ← Frontend interactivity and API integration
│
├── backend/                ← Node.js + Express API
│   ├── server.js           ← Main server
│   ├── package.json
│   ├── .env.example        ← Copy to .env
│   ├── routes/
│   │   ├── waitlist.js     ← POST /api/waitlist
│   │   ├── restaurant.js   ← POST /api/restaurant/register
│   │   └── contact.js      ← POST /api/contact
│   ├── utils/
│   │   └── db.js           ← JSON file database utility
│   └── data/               ← Auto-created: stores JSON files
│       ├── waitlist.json
│       ├── restaurants.json
│       └── contacts.json
│
└── README.md
```

---

## 🚀 Quick Start

### 1. Run the Backend

```powershell
cd backend

# Copy environment file
Copy-Item .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

Backend runs at: **http://localhost:5000**

### 2. Open the Frontend

Open `frontend/index.html` in your browser.  
Or use VS Code's **Live Server** extension for hot reload.

---

## 🔗 API Endpoints

| Method | Endpoint                        | Description                        |
|--------|---------------------------------|------------------------------------|
| `GET`  | `/health`                       | Health check                       |
| `GET`  | `/api/stats`                    | Public stats (waitlist count, etc.)|
| `POST` | `/api/waitlist`                 | Join email waitlist                |
| `GET`  | `/api/waitlist/count`           | Get waitlist count                 |
| `POST` | `/api/restaurant/register`      | Restaurant partner application     |
| `GET`  | `/api/restaurant/list`          | List all applications (admin)      |
| `GET`  | `/api/restaurant/stats`         | Restaurant application stats       |
| `POST` | `/api/contact`                  | Submit contact form                |
| `GET`  | `/api/contact/messages`         | View all messages (admin)          |

### Admin Access
Add header `x-admin-key: swadisheats-admin-2024` to admin endpoints.  
> Change this key in your `.env` file before going live!

---

## 📊 Example API Calls

### Join Waitlist
```bash
curl -X POST http://localhost:5000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com"}'
```

### Register Restaurant
```bash
curl -X POST http://localhost:5000/api/restaurant/register \
  -H "Content-Type: application/json" \
  -d '{
    "ownerName": "Raju Bhai",
    "phone": "9876543210",
    "restaurantName": "Raju Dhaba",
    "city": "Mahuva",
    "cuisine": "Gujarati"
  }'
```

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | HTML5, CSS, JS, Chart.js (Analytics)|
| Backend   | Node.js + Express.js              |
| Dashboards| Multi-Role (Customer / Admin)     |
| Database  | JSON files (dev) → MongoDB (prod) |
| Security  | Helmet.js, CORS                   |

---

## 📋 Legal Checklist (Before Launch)

- [ ] Register company (Private Limited or OPC)
- [ ] Get FSSAI License
- [ ] GST Registration
- [ ] Razorpay / Cashfree KYC
- [ ] Privacy Policy page
- [ ] Terms of Service page
- [ ] Delivery partner agreements

---

## 🗓️ Roadmap

| Phase    | Timeline    | Goal                               |
|----------|-------------|------------------------------------|
| MVP      | Month 1–5   | Landing page, waitlist, beta       |
| Growth   | Month 5–9   | App launch, 20+ restaurants        |
| Expand   | Month 10–12 | 2nd city, loyalty program          |
| Future   | Year 2+     | Own shop, cloud kitchen, B2B       |

---

Made with ❤️ in Mahuva, Gujarat 🇮🇳
