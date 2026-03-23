# Rajvista - Luxury Hotel Management System

A modern, full-featured hotel management dashboard built with React and TypeScript. Rajvista is a comprehensive web application for managing luxury heritage hotels in Rajasthan, featuring AI-powered services, biometric verification, multi-role access, and real-time analytics.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture & Components](#architecture--components)
- [Features Breakdown](#features-breakdown)
- [API Integration](#api-integration)
- [Data Management](#data-management)
- [User Roles](#user-roles)

---

## 🎯 Overview

**Rajvista** is a luxury hotel management system designed for Rajasthan's premier heritage hotel properties. The platform provides:
- **Guest Portal**: Browse hotels, book rooms, order food, book spa services
- **Staff Dashboard**: Manage daily tasks and shift assignments
- **Admin Dashboard**: Monitor operations, analytics, and guest registry
- **AI Concierge**: Powered by Google Gemini API for intelligent guest assistance
- **Biometric Security**: Face recognition for guest verification

**Target Properties**: Rambagh Palace (Jaipur), Oberoi Udaivilas (Udaipur), Umaid Bhawan Palace (Jodhpur), and 20+ heritage hotels across Rajasthan.

---

## ✨ Key Features

### 🛏️ Guest Features
- **Hotel Discovery & Browsing**: Search and filter by city, category, price range
- **Multi-Platform Booking**: Integrate with MakeMyTrip, Agoda, Booking.com, Goibibo, Cleartrip, Rajvista Official
- **Room Booking**: Multiple room types (Standard, Deluxe, Suite) with dynamic pricing
- **Food Ordering**: Digital menu with Rajasthani and international cuisine
- **Spa Booking**: Schedule relaxation services with real-time availability
- **Live Chat Support**: AI-powered virtual concierge for instant assistance
- **Real-time Occupancy**: View live occupancy updates across properties

### 👤 Guest Registration
- **Email/Password Authentication**: Secure account creation
- **Biometric Verification**: Face recognition for enhanced security
- **Guest Profiling**:
  - Domestic guests: State, ID proof type (Aadhar, Driving License, PAN)
  - International guests: Country, Passport information
- **Password Recovery**: Forgot password functionality with secure reset

### 📊 Admin Features
- **Real-time Dashboard Analytics**: 
  - Total registered guests, staff, and admins
  - Guest origin breakdown (Domestic vs International)
  - Weekly check-in and booking trends
- **User Management**: View, filter, and delete users by role
- **Data Export**: Download guest registry as CSV with full details
- **Hotel Assignment**: Admins assigned to specific hotel properties
- **Role Filtering**: Filter users by role (Guests, Staff, Admins)

### 💼 Staff Features
- **Task Management**: Daily task assignments with priority levels
- **Task Status Tracking**: Mark tasks as completed
- **Shift Information**: View shift times and clock in/out
- **Notifications**: Real-time alerts for urgent tasks

### 🤖 AI Concierge (Gemini Integration)
- **Context-Aware Responses**: Understands guest history and hotel details
- **Multilingual Support**: Assists in property-specific queries
- **Service Guide**: Provides information about amenities, timings, and local attractions
- **Natural Language Understanding**: Processes guest queries naturally

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 19.2.3 | UI components and state management |
| **Language** | TypeScript 5.8 | Type safety and code reliability |
| **Build Tool** | Vite 6.2.0 | Fast module bundling and development server |
| **UI Components** | Lucide React | Consistent icon library (200+ icons) |
| **Charts & Analytics** | Recharts 3.5.1 | Interactive data visualization |
| **AI API** | Google Gemini 2.5 Flash | AI concierge and intelligent responses |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **State Management** | React Hooks (useState) | Local component state and effects |
| **Data Storage** | LocalStorage | Persistent user and hotel data |

**Development Dependencies:**
- @vitejs/plugin-react: React integration for Vite
- @types/node: Node.js type definitions

---

## 📁 Project Structure

```
rajvista/
├── App.tsx                      # Main application component with auth logic
├── index.tsx                    # React entry point
├── index.html                   # HTML template
├── types.ts                     # TypeScript interfaces and enums
├── metadata.json                # Project metadata
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
├── .env.local                   # Environment variables (GEMINI_API_KEY)
│
├── components/
│   ├── UserDashboard.tsx        # Guest portal (300+ lines)
│   ├── AdminDashboard.tsx       # Admin analytics dashboard
│   └── StaffDashboard.tsx       # Staff task management
│
├── services/
│   ├── geminiService.ts         # Google Gemini API wrapper
│   └── storageService.ts        # LocalStorage CRUD operations
│
└── data/
    └── hotelData.ts             # Hotel inventory, mock data
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- npm or yarn package manager
- Google Gemini API key

### Installation

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
   The application will start at `http://localhost:5173`

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

### Test Credentials

**Admin User:**
- Email: `admin@rajvista.com`
- Password: `admin123`

**Sample Guest:**
- Email: `amitabh@guest.com`
- Can register new guests with any email/password

---

## 🏗️ Architecture & Components

### Component Hierarchy

```
App (Main Container)
├── LOGIN VIEW
│   ├── Email/Password Input
│   ├── Role Selector (Guests only)
│   └── Links to Register/Forgot Password
│
├── REGISTER VIEW
│   ├── Basic Info (Email, Password, Name)
│   ├── Biometric Capture (Face Recognition)
│   ├── Guest Details
│   │   ├── Domestic: State + ID Proof
│   │   └── International: Country + Passport
│   └── Confirmation
│
├── FORGOT PASSWORD VIEW
│   ├── Email Verification
│   └── Password Reset
│
└── DASHBOARD VIEW
    ├── UserDashboard (Guests)
    ├── AdminDashboard (Admins)
    └── StaffDashboard (Staff)
```

### App.tsx (Main Component - ~800 lines)

**Key Responsibilities:**
- User authentication (Login, Register, Password Reset)
- Biometric face comparison algorithm
- View routing between Login, Register, and Dashboards
- Role-based access control
- UI state management (forms, modals, loading states)

**Key Functions:**
- `compareBiometricData()`: Pixel-based face recognition using Canvas API
- `handleLogin()`: Credential verification and biometric prompt
- `handleRegister()`: New user registration with face capture
- `handlePasswordReset()`: Secure password recovery

**State Variables:**
```typescript
const [currentUser, setCurrentUser] = useState<User | null>();
const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'FORGOT' | 'DASHBOARD'>();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loginPhase, setLoginPhase] = useState<'CREDENTIALS' | 'FACE_VERIFY'>();
```

---

### UserDashboard.tsx (Guest Portal - ~1200 lines)

**Primary Features:**
1. **Hotel Search & Filter**
   - Search by name, city, rating
   - Filter by category (Luxury, Medium, Normal)
   - Sort by price, rating, occupancy

2. **Hotel Details Modal**
   - High-resolution images
   - Detailed descriptions
   - Real-time occupancy
   - Guest reviews and ratings

3. **Room Booking System**
   - Multiple room types per hotel
   - Dynamic pricing based on category
   - Date selection (number of days)
   - Multi-platform booking redirection
   - Booking confirmation

4. **Food & Dining**
   - Digital menu with 8+ items
   - Rajasthani and international cuisine
   - Add to cart, quantity adjustment
   - Order total calculation
   - Order confirmation

5. **Spa Services**
   - Book spa hours (1-24 hours)
   - Time slot selection
   - Price: ₹5,000/hour
   - Booking confirmation

6. **AI Concierge Chat**
   - Context-aware conversation
   - Hotel-specific information
   - Real-time responses
   - Chat history display

7. **Live Analytics**
   - City-wise occupancy rates
   - Global statistics (capacity, occupancy %)
   - Trend indicators (Rising/Falling/Stable)
   - Live traffic simulation (updates every 2.5s)

**Data Structures:**
```typescript
interface Room {
  number: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'CHECKOUT_SOON';
  type: 'NORMAL' | 'MEDIUM' | 'LUXURY';
  price: number;
  label: string;
}

interface FoodItem {
  id: string;
  name: string;
  category: 'Royal' | 'Main' | 'Starter' | 'Beverage';
  price: number;
}

interface BookingPlatform {
  id: string;
  name: string;
  baseVariance: number; // Price multiplier
  url: string;
}
```

**Booking Platforms Integrated:**
- Rajvista Official (100% price)
- MakeMyTrip (-2% discount)
- Agoda (-8% discount)
- Booking.com (+2% premium)
- Goibibo (-5% discount)
- Cleartrip (-3% discount)

---

### AdminDashboard.tsx (~400 lines)

**Key Features:**
1. **Analytics Overview**
   - Total users count (Guests, Staff, Admins)
   - Distribution pie charts
   - Weekly activity bar chart
   - System status indicators

2. **User Management**
   - Real-time user list
   - Filter by role
   - Delete user functionality
   - Prevent admin from deleting self

3. **Data Export**
   - CSV download of all users
   - Includes biometric data (Base64)
   - Fields: ID, Name, Email, Role, Origin, Location, ID Type, etc.
   - Timestamped filename

4. **Hotel Assignment**
   - Admin assigned to specific hotel
   - Property-specific analytics
   - Command center for assigned property

**Charts Used:**
- PieChart: User distribution by role
- BarChart: Weekly check-ins and bookings

---

### StaffDashboard.tsx (~150 lines)

**Responsibilities:**
1. **Task Management**
   - Display assigned tasks
   - Priority levels (High/Medium)
   - Status tracking (Pending/Completed)
   - Mark tasks as done

2. **Shift Overview**
   - Shift start/end times
   - Clock out functionality
   - Notifications for urgent tasks

3. **Notifications**
   - Alert badge showing pending tasks
   - Real-time updates

---

## 🔧 Features Breakdown

### Authentication System

**Flow:**
```
User → Login Form → Credential Check → (If facial recognition enabled) → Face Verification → Dashboard
        ↓
      Register → Face Capture → Guest Details → Confirmation → Auto-login
        ↓
      Forgot Password → Email Verification → Reset → Login
```

**Security Measures:**
- Password validation
- Email uniqueness check
- Biometric face verification
- Role-based access control

### Biometric Comparison Algorithm

Located in `App.tsx`:
```typescript
// 1. Load registered and current face images
// 2. Resize to 50x50 pixels (sufficient for structural comparison)
// 3. Convert RGB to grayscale brightness
// 4. Compare pixel intensity differences
// 5. Calculate match percentage

matchPercentage = 100 - ((totalDifference / maxPossible) * 100);
// Match > 70% = Face recognized
```

### Room Booking Workflow

1. User selects hotel
2. Chooses room type (NORMAL, MEDIUM, LUXURY)
3. Selects number of days
4. Reviews price calculation
5. Selects booking platform (automatic redirection)
6. Booking confirmation modal

**Price Calculation:**
```
Room Price = Base Hotel Price × Room Type Multiplier × Platform Variance
Platform Variance: MakeMyTrip (0.98), Agoda (0.92), Booking (1.02), etc.
```

### Food & Dining System

**Menu Items (8 items):**
- **Royal**: Dal Baati Churma (₹850), Laal Maas (₹1100)
- **Starters**: Murgh Malai Tikka (₹650), Paneer Tikka (₹550)
- **Main Course**: Butter Chicken (₹750), Vegetables Biryani (₹600)
- **Beverages**: Masala Chai (₹200), Sweet Lassi (₹250)

**Cart Features:**
- Add/Remove items
- Quantity adjustment
- Running total calculation
- Order confirmation

### Analytics & Real-time Data

**Data Updates:**
- Live occupancy: Updates every 2.5 seconds
- Guest registry: Polls every 5 seconds
- Chart animations with smooth transitions
- Percentage-based occupancy display

**Metrics Tracked:**
- Total capacity across all properties
- Current occupancy
- Occupancy percentage
- Sold-out hotels count
- Available hotels count
- City-wise breakdown

---

## 🔌 API Integration

### Google Gemini API (geminiService.ts)

**Purpose:** AI-powered concierge for guest assistance

**Configuration:**
```typescript
const model = "gemini-2.5-flash";
const apiKey = process.env.VITE_GEMINI_API_KEY;
```

**System Prompt:**
```
"You are the Virtual Concierge for Rajvista Hotels..."
- Polite, luxurious tone
- Aware of guest name and hotel details
- Provides info about check-in/out, amenities, local culture
```

**Query Flow:**
1. Guest types question in chat
2. Service wraps in system prompt with context
3. Calls `generateContent()` with Gemini API
4. Returns formatted response
5. Adds to chat history

**Error Handling:**
- Missing API key: Returns friendly message
- API errors: Logs and returns retry message

---

## 💾 Data Management

### LocalStorage Implementation (storageService.ts)

**Storage Key:** `rambagh_palace_db_v2_guest_only`

**CRUD Operations:**
```typescript
getUsers()                          // Fetch all users
addUser(user: User)                 // Create new user
findUserByEmail(email: string)       // Search user
updateUserPassword(email, password)  // Update password
deleteUser(userId: string)           // Remove user
```

**Initial Data:**
- 6 dummy users (3 domestic, 3 international)
- Used for testing and demo purposes

**Data Schema (User Object):**
```typescript
{
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: ISO Date string;
  
  // Biometric
  faceImage?: Base64 string;
  
  // Guest-specific
  origin?: 'DOMESTIC' | 'INTERNATIONAL';
  location?: State (domestic) or Country (international);
  idProofType?: 'Aadhar', 'Driving License', 'PAN', 'Passport';
  idProofNumber?: ID number;
  
  // Admin/Staff
  assignedHotelId?: string;
}
```

---

## 👥 User Roles

### 1. **Guest/User (UserRole.USER)**

**Permissions:**
- ✅ Browse hotels and properties
- ✅ Book rooms via multiple platforms
- ✅ Order food and beverages
- ✅ Book spa services
- ✅ Chat with AI concierge
- ✅ View real-time occupancy
- ✅ Manage profile and settings
- ❌ Cannot manage other users
- ❌ Cannot access admin analytics

**Dashboard:** UserDashboard component

**Registration Requirements:**
- Email and password
- Face biometric capture
- Guest details (origin, location, ID proof)

### 2. **Staff (UserRole.STAFF)**

**Permissions:**
- ✅ View task assignments
- ✅ Mark tasks as completed
- ✅ Clock in/out for shifts
- ✅ View shift information
- ❌ Cannot modify other staff tasks
- ❌ Cannot access analytics
- ❌ Cannot manage guests

**Dashboard:** StaffDashboard component

**Features:**
- Task management
- Shift tracking
- Notifications for urgent tasks

### 3. **Admin (UserRole.ADMIN)**

**Permissions:**
- ✅ View all users
- ✅ Delete users
- ✅ Filter users by role
- ✅ Export user data (CSV)
- ✅ View analytics and charts
- ✅ Access hotel-specific data (if assigned)
- ✅ Monitor system health
- ❌ Cannot delete own admin account
- ❌ Cannot modify guest bookings directly

**Dashboard:** AdminDashboard component

**Analytics Access:**
- User statistics
- Role distribution
- Weekly activity trends
- Real-time system status
- Data export capabilities

---

## 🏨 Hotel Properties

### Featured Hotels (13+ properties)

**Top Tier Luxury:**
- **Rambagh Palace** (Jaipur) - ₹45,000/night - 4.9/5 rating
- **Oberoi Udaivilas** (Udaipur) - ₹52,000/night - 5.0/5 rating
- **Umaid Bhawan Palace** (Jodhpur) - ₹38,000/night - 4.9/5 rating

**Locations Covered:**
- Jaipur, Udaipur, Jodhpur, Jaisalmer, Pushkar
- Mount Abu, Bikaner, Ajmer, Chittorgarh
- Sawai Madhopur, Mandawa, Alwar, Kumbhalgarh

**Room Categories:**
- **NORMAL**: Standard rooms (base price)
- **MEDIUM**: Deluxe rooms (1.5x base price)
- **LUXURY**: Royal suites (2.5x base price)

**Room Statuses:**
- AVAILABLE: Ready for booking
- OCCUPIED: Currently booked
- CHECKOUT_SOON: Guest checking out within 24 hours

---

## 🎨 UI/UX Design System

### Color Palette
- **Primary**: Amber/Brown (#92400e, #d97706, #fcd34d)
- **Accent**: Gold for luxury feel
- **Backgrounds**: Warm neutral tones
- **Text**: Indian palace imagery backgrounds

### Typography
- **Serif Font**: Used for headings (royal aesthetic)
- **Mono Font**: Used for data displays and times
- **Icons**: Lucide React (200+ icons available)

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg
- Adaptive layouts for components
- Touch-friendly interactions

---

## 📊 State Management Flow

### Authorization Flow
```
Login → Validate Credentials → Get User → 
  (if biometric required) → Capture Face → Compare Biometric → 
  setCurrentUser() → Render Dashboard
```

### Hotel Selection Flow
```
Browse Hotels → Select Hotel → 
  Load Hotel-Specific Configuration → 
  Generate Room List → 
  Initialize Concierge → 
  Ready for Booking
```

### Booking Flow
```
Select Room Type → Set Booking Days → 
  Calculate Price → 
  Choose Platform → 
  Confirm Booking → 
  Show Success Modal
```

---

## 🔒 Security Considerations

**Current Implementation:**
- Password stored locally (should use hashed passwords in production)
- API key in environment variables (not exposed)
- Face verification for biometric security
- User data persisted in localStorage

**Recommendations for Production:**
- Move to backend authentication (JWT tokens)
- Use HTTPS for all communications
- Implement password hashing (bcrypt)
- Validate all inputs server-side
- Implement rate limiting on API calls
- Use secure session management
- Add CSRF protection
- Implement proper access control lists

---

## 📦 Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.3 | UI framework |
| react-dom | ^19.2.3 | React DOM rendering |
| @google/genai | ^1.33.0 | Gemini API client |
| recharts | ^3.5.1 | Chart components |
| lucide-react | ^0.561.0 | Icon library |
| typescript | ~5.8.2 | Type checking |
| vite | ^6.2.0 | Build tool |

---

## 🚀 Deployment

### Build Steps
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output: dist/ folder ready for deployment
```

### Hosting Options
- Vercel (recommended for Vite)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Environment Variables
```
VITE_GEMINI_API_KEY=your_key_here
```

---

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- Backend API integration
- Payment gateway (Razorpay, Stripe)
- Real SMS/Email notifications
- Advanced analytics
- Mobile app version
- Multi-language support

---

## 📝 License

This project is developed for Rajvista Hotels.

---

## 🆘 Support

For issues, questions, or feature requests, please contact the development team or create an issue in the repository.

---

## 📞 Contact

**Project**: Rajvista - Luxury Hotel Management System  
**Version**: 0.0.0  
**Last Updated**: March 2025

---

**Happy Coding! 🎉**
