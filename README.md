# 🏟️ StadiumFlow

**Next-Gen AI Crowd Intelligence & Smart Venue Companion**

StadiumFlow is a high-performance venue management platform designed to solve real-world congestion problems in large stadiums. By combining **Deterministic Routing**, **Predictive AI**, and **Real-time Commerce**, StadiumFlow ensures a seamless, frictionless experience for fans and a data-driven command center for administrators.

---

## 🚀 Key Features

### 🧠 1. AI-Powered Crowd Analysis
- **Gemini 1.5 Flash Integration**: Real-time analysis of stadium telemetry to predict hotspots and optimize gate traffic.
- **Smart Forecasting**: Predictive insights on crowd movement and bottleneck avoidance.

### 🗺️ 2. Dynamic Pathfinding & Navigation
- **Congestion-Aware Routing**: Custom Dijkstra implementation that adjusts path weights based on live crowd density.
- **Find My Seat**: Interactive stadium map with animated polyline routing from gate to section.
- **Multi-Route Comparison**: Compare different entry/exit points based on current traffic.

### 🍔 3. Integrated Commerce (Food & Beverage)
- **Multi-Vendor Marketplace**: Unified ordering from all stadium vendors.
- **Smart Pickup Plan**: Intelligent grouping of orders with shop-wise pickup instructions.
- **Express Checkout**: Mock payment gateway with UPI (QR) and Cash-at-Counter options.

### ⚡ 4. Live Event Synchronization
- **IPL Live Scores**: Real-time cricket score integration with resilient rate-limiting and auto-fallback.
- **Telemetry Heartbeat**: 8-second refresh cycle for all crowd density data across gates, sections, and facilities.

### 🛡️ 5. Administrative Command Center
- **Dual Management Tiers**: 
  - **Super Admin**: Global control over venue structure, shop approvals, and live requests.
  - **Shop Admin**: Vendor portal for managing menu items, registration, and order status.
- **Role-Based Access**: Dedicated flows for Audience, Admin, and Merchants.

### 🔐 6. Secure & Seamless Auth
- **Firebase Integration**: Robust Google Authentication.
- **Guest Access**: Instant "Guest Node" mode for quick demonstrations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla JavaScript (ES6+), CSS3, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **AI / ML** | Google Gemini 1.5 Flash API |
| **Database/Auth** | Firebase Authentication, Local Store Persistence |
| **Visualization** | HTML5 Canvas, Chart.js, FontAwesome 6 |
| **Utilities** | Zod (Validation), Axios, Express Rate Limit |

---

## 🏗️ Project Structure

```text
PhysicalEventExp/
├── frontend/
│   ├── assets/          # Icons, Favicons, Branding
│   ├── components/      # Dynamic Navbar, Footer
│   ├── css/             # Global Design System (Glassmorphism)
│   ├── js/              # Core Logic (Auth, Routing, API, UI)
│   ├── pages/           # Application Screens (Home, Dash, Heatmap, etc.)
│   └── index.html       # Entry Point (Redirector)
├── backend/
│   ├── controllers/     # Business Logic (Crowd, AI, Scores)
│   ├── routes/          # Express API Endpoints
│   ├── services/        # Routing Algorithm (Dijkstra)
│   ├── tests/           # API Test Suite
│   └── server.js        # Entry Node Server
├── package.json         # Dependencies & Scripts
└── README.md            # Project Documentation
```

---

## 📸 Interface Preview

*(Screenshots represent the premium glassmorphic UI)*

| **Home Dashboard** | **AI Analysis** |
| :---: | :---: |
| ![Home](https://github.com/user-attachments/assets/82cb7905-a002-4c84-b3d9-6d2f21023dae) | ![AI](https://github.com/user-attachments/assets/70bf7641-ef43-4adc-a91f-e80b1769f849) |

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v16+)
- Google Gemini API Key
- Firebase Project Config

### 2. Installation
```bash
git clone https://github.com/Yashrajsinh-Kanchva/PhysicalEventExp.git
cd PhysicalEventExp
npm install
```

### 3. Configuration (`.env`)
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_key
PORT=3000

FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
# ... other firebase config keys
```

### 4. Running Locally
```bash
npm start
```
Access at: `http://localhost:3000`

---

## 🧪 Testing
The project includes a lightweight API test suite to verify endpoint stability:
```bash
npm test
```
**Tests Covered**:
- ✅ Server Startup & Port Binding
- ✅ Crowd Data Simulation Consistency
- ✅ Routing Algorithm Accuracy
- ✅ AI Payload Validation

---

## ℹ️ Demo Mode Note
StadiumFlow is designed for **Demo and Hackathon** settings.
- **Authentication**: Advanced validation (username/password/security) is bypassed for demo convenience via Role Selection.
- **Telemetry**: Crowd data is simulated using deterministic randomization for repeatable testing.

---

**Developed with ❤️ by Yashrajsinh Kanchva**
