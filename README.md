# 🏟️ Stadium Flow

### *Smart Stadium Experience Platform for Crowd, Navigation & Food Ordering*

[![GitHub Stars](https://img.shields.io/github/stars/Yashrajsinh-Kanchva/GCloud-APL-Challenge1?style=for-the-badge&color=ffd700)](https://github.com/Yashrajsinh-Kanchva/GCloud-APL-Challenge1)
[![License](https://img.shields.io/github/license/Yashrajsinh-Kanchva/GCloud-APL-Challenge1?style=for-the-badge&color=blue)](LICENSE)
[![Hackathon Ready](https://img.shields.io/badge/Hackathon-Ready-orange?style=for-the-badge)](https://github.com/Yashrajsinh-Kanchva/GCloud-APL-Challenge1)

---

## 📌 2. Problem Statement

Attending events in large stadiums often comes with frustrating challenges that dampen the fan experience:

*   **Crowd Congestion:** Massive bottlenecks at entry and exit gates.
*   **Long Food Queues:** Fans spend more time in line than watching the game.
*   **Poor Navigation:** Finding seats or specific amenities in vast complexes is difficult.
*   **Lack of Real-time Insights:** Stadium management lacks live data to handle crowd flow effectively.

---

## 💡 3. Solution

**Stadium Flow** is a comprehensive solution designed to modernize the stadium experience through AI-driven insights and smart commerce.

*   **Smart Dashboard:** A centralized hub for fans to access all stadium services.
*   **Heatmap Visualization:** Real-time crowd density tracking for both fans and admins.
*   **Shop-Based Food Ordering:** Skip the lines with digital menus and scheduled pickups.
*   **AI Insights (Gemini):** Leverages Google Gemini AI to predict crowd patterns and provide smart recommendations.
*   **Multi-Role System:** Tailored experiences for **Audience**, **Global Admins**, and **Shop Owners**.

---

## ✨ 4. Key Features

### 👤 Audience Side
*   📍 **Seat Navigation:** Interactive pathfinding from your current gate directly to your seat.
*   🔥 **Live Heatmap:** Visualize crowd density to avoid congested areas.
*   🍔 **Food Ordering:** Browse shops, view menus, and place orders directly from your phone.
*   🛒 **Cart & Checkout:** Seamless management of multiple items with a mock checkout flow.
*   🛍️ **Pickup System:** Dedicated pickup notifications (no delivery required, reducing stadium traffic).

### 🛠️ Admin Side
*   🏪 **Shop Management:** Full control over shop registrations and active vendors.
*   ✅ **Approval System:** Review and approve new shop requests or item additions.
*   📊 **Command Dashboard:** High-level overview of stadium status and active orders.
*   🕹️ **Control System:** Ability to manage venue-wide settings and crowd flow alerts.

### 🏪 Shop Admin Side
*   📝 **Vendor Registration:** Simple onboarding for food and merchandise vendors.
*   📦 **Inventory Management:** Add/Edit menu items and pricing.
*   🔄 **Request Tracking:** Real-time status updates on shop and item approvals.

### 🤖 AI Features
*   📈 **Crowd Prediction:** Uses **Google Gemini API** to analyze telemetry and forecast bottlenecks.
*   💡 **Smart Fallback Insights:** Robust AI-driven suggestions that work even during data anomalies.

---

## 🧠 5. Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **AI Integration** | Google Gemini 1.5 Flash API |
| **Authentication** | Firebase Authentication |
| **Database** | Firebase / Local Store |
| **UI/UX** | Glassmorphism, FontAwesome, Google Fonts |

---

## 🎮 6. How to Run

Follow these steps to get Stadium Flow running locally:

1.  **Clone the repo**
    ```bash
    git clone https://github.com/Yashrajsinh-Kanchva/GCloud-APL-Challenge1.git
    cd GCloud-APL-Challenge1
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file and add your Google Gemini API Key and Firebase credentials.

4.  **Run the project**
    ```bash
    npm start
    ```

5.  **Open in browser**
    Navigate to `http://localhost:3000`

---

## 🔐 7. Note (IMPORTANT)

> [!IMPORTANT]
> **This project currently runs in Demo Mode.**
> Authentication and advanced validations (username, password, role-based access) are pre-configured for demonstration purposes. Full production-grade security can be toggled as needed.

---

## 📸 8. Screenshots
> *Experience the premium, glassmorphic UI design of Stadium Flow.*

<p align="center">
  <img src="https://github.com/user-attachments/assets/82cb7905-a002-4c84-b3d9-6d2f21023dae" width="45%" alt="Home Page" />
  <img src="https://github.com/user-attachments/assets/70bf7641-ef43-4adc-a91f-e80b1769f849" width="45%" alt="Dashboard" />
</p>

*   **Home Page** - The central hub for all fan activities.
*   **Admin Dashboard** - Real-time monitoring and management.
*   **Heatmap** - Visualizing stadium density.
*   **Food Order** - Seamless shop-based ordering interface.
*   **Admin Panel** - Shop and item approval workflows.
*   **Shop Admin Panel** - Vendor-specific management portal.

---

## 🌍 9. Future Enhancements

*   💳 **Real-time Payments:** Integration with Stripe or Razorpay for actual transactions.
*   🔐 **Full Auth System:** Extended RBAC (Role-Based Access Control) with biometric options.
*   🚚 **Live Delivery Tracking:** Optional seat-side delivery for VIP sections.
*   📊 **Advanced AI Analytics:** Historical data analysis for multi-event planning.
*   📱 **Mobile App Version:** Native iOS and Android versions using React Native or Flutter.

---

## 👨‍💻 10. Author

**Yashrajsinh Kanchva**
*   GitHub: [@Yashrajsinh-Kanchva](https://github.com/Yashrajsinh-Kanchva)
*   LinkedIn: [Yashrajsinh Kanchva](https://www.linkedin.com/in/yashrajsinh-kanchva/)

---

## ⭐ 11. Contribution / Support

If you like this project, please consider giving it a ⭐ on GitHub! Contributions are welcome—feel free to open an issue or submit a pull request.

---
<p align="center">Made with ❤️ for the Smart Stadium Experience</p>
