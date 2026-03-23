



# 🏰 Rajvista - Luxury Hotel Management System

A comprehensive hotel management dashboard built with React, TypeScript, and Vite. Rajvista provides luxury heritage hotels in Rajasthan with an integrated platform featuring guest portals, admin analytics, staff management, and AI-powered concierge services powered by Google Gemini API.

## 🌟 Key Features

✨ **Guest Portal**
- Browse 20+ luxury heritage hotels across Rajasthan
- Book rooms via multiple platforms (MakeMyTrip, Agoda, Booking.com, etc.)
- Order food and spa services
- Chat with AI concierge for instant assistance
- Real-time occupancy viewing

👤 **User Registration & Security**
- Email/password authentication
- Biometric face recognition verification
- Guest profiles for domestic and international visitors
- ID proof tracking (Aadhar, Passport, Driving License, PAN)

📊 **Admin Dashboard**
- Real-time analytics and statistics
- User management and role filtering
- Guest registry with data export (CSV)
- Weekly activity trends and occupancy reports
- Hotel-specific command centers

💼 **Staff Portal**
- Daily task assignments
- Priority-based task management
- Shift tracking and clock in/out
- Real-time notifications

🤖 **AI Concierge**
- Powered by Google Gemini 2.5 Flash
- Context-aware hotel information
- Natural language guest support
- Hotel-specific details and amenities

---

## 🚀 Run Locally

**Prerequisites:**  
- Node.js (v16.0.0 or higher)
- npm or yarn
- Google Gemini API key

**Steps:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the project root:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## 🏗️ Project Structure

```
rajvista/
├── App.tsx                      # Main auth & routing logic
├── components/
│   ├── UserDashboard.tsx       # Guest portal (hotels, booking, food, spa)
│   ├── AdminDashboard.tsx      # Admin analytics & user management
│   └── StaffDashboard.tsx      # Staff task management
├── services/
│   ├── geminiService.ts        # Google Gemini API integration
│   └── storageService.ts       # LocalStorage data management
├── data/
│   └── hotelData.ts            # Hotel inventory & mock data
└── types.ts                     # TypeScript interfaces
```

---

## 💻 Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI components and state management |
| **TypeScript** | Type-safe development |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Styling and responsive design |
| **Recharts** | Interactive charts and analytics |
| **Lucide React** | 200+ premium icons |
| **Google Gemini API** | AI concierge services |

---

## 👥 User Roles

### 🛏️ **Guest (User)**
- Browse and book hotels
- Order food and spa services
- Chat with AI concierge
- View real-time occupancy
- Access guest portal

### 👔 **Staff**
- Manage daily task assignments
- Track shift timings
- Mark tasks as completed
- View notifications

### 🔐 **Admin**
- View all users and analytics
- Filter users by role
- Export guest registry as CSV
- Monitor system health
- Access hotel-specific data

---

## 🏨 Featured Hotels

**Properties Include:**
- Rambagh Palace (Jaipur) - ₹45,000/night ⭐ 4.9/5
- Oberoi Udaivilas (Udaipur) - ₹52,000/night ⭐ 5.0/5
- Umaid Bhawan Palace (Jodhpur) - ₹38,000/night ⭐ 4.9/5
- 20+ additional heritage properties across Rajasthan

---

## 🔧 Core Features Breakdown

### Hotel Booking System
- Multi-platform integration (6 booking platforms)
- Dynamic pricing based on room type and platform
- Real-time room availability
- Booking confirmation and details

### Food & Dining
- 8+ menu items including Rajasthani specialties
- Digital ordering with quantity control
- Order total calculation
- Confirmation workflow

### Spa Services
- Book spa hours (1-24 hours available)
- Time slot selection
- Pricing: ₹5,000/hour

### Real-time Analytics
- Live occupancy updates (2.5 second refresh)
- City-wise occupancy breakdown
- Global statistics dashboard
- Trend indicators

### AI Concierge Chat
- Context-aware conversations
- Hotel and guest-specific responses
- Amenities information
- 24/7 availability

---

## 👤 Test Credentials

**Admin Account:**
- Email: `admin@rajvista.com`
- Password: `admin123`

**Guest Accounts:**
- Email: `amitabh@guest.com`
- Or register a new account with any email/password

---

## 🔒 Security Features

- Email/password authentication
- Biometric face recognition verification
- Role-based access control
- Secure API key management
- User data persistence with localStorage

---

## 📈 Data Management

- **Storage**: LocalStorage with JSON serialization
- **User Data**: Complete guest profiles with biometric data
- **Export**: CSV download with all user information
- **Real-time**: Updates every 2.5-5 seconds

---

## 🤖 AI Integration

The application integrates Google's Gemini 2.5 Flash API for intelligent concierge services:

```typescript
// Example: Guest asks about amenities
"What spa services are available?"
// AI Concierge responds with hotel-specific information
```

---

## 📦 Build & Deploy

### Build
```bash
npm run build
```

### Deploy To
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

---

## 🎯 Future Enhancements

- Payment gateway integration (Razorpay, Stripe)
- SMS/Email notifications
- Mobile app (React Native)
- Advanced reporting and forecasting
- Multi-language support
- Real backend database integration

---

## 📚 Documentation

For detailed component documentation, architecture breakdown, and technical specifications, see [README_DETAILED.md](./README_DETAILED.md)

---

## 📞 Support

For issues or questions, contact the development team.

---

**Version**: 0.0.0  
**Last Updated**: March 2025  
**License**: Proprietary - Rajvista Hotels
