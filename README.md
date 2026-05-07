# 🌎 Veci – Latin Community App

Mobile application focused on connecting the Latin American community living abroad in Europe.

---

## 🚀 Tech Stack

### Frontend
- React Native (Expo)
- Expo Router
- TypeScript
- Context API (Auth & Global State)

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary (image upload)

---

## 📱 Core Features

### 🔐 Authentication
- Login with JWT
- Persistent session (AsyncStorage)
- Auth gating (actions require login only when needed)

### 🧭 Discover Feed
- Event listing (like Eventbrite)
- Ads integration
- Optimistic UI updates

### ❤️ Favorites System
- Add/remove favorites
- Stored in backend (MongoDB)
- Synced with frontend state

### 👤 User Profile
- View user information
- Edit profile (name, city, bio)
- Upload profile image (Cloudinary)
- Persistent user data

### 🖼️ Image Upload System
- Image picker (Expo)
- Upload via backend (Multer + Cloudinary)
- Real-time preview
- Secure (JWT protected)

---

## 🧠 Architecture

Frontend:

Feature-based structure:
src/
features/
auth/
discover/
user/
shared/
context/
services/

---

Backend:

modules/
auth/
users/
events/
discover/

---

## 🔐 Security

- JWT authentication middleware
- Protected routes (users, favorites, uploads)
- Environment variables (.env not committed)

---

## 📦 API Endpoints

### Auth
- POST /api/v1/auth/login
- POST /api/v1/auth/register

### Users
- PUT /api/v1/users/me
- POST /api/v1/users/favorites/:eventId
- POST /api/v1/users/upload-profile-image

### Discover
- GET /api/v1/discover

---

## ⚙️ Setup

### Backend

```bash
cd apps/backend
npm install
npm run dev

### Frontend

cd apps/mobile
npm install
npx expo start
