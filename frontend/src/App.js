import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { AuthProvider } from './context/AuthContext';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// Import Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import Components
import Header from './components/Header/Header';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Home from './pages/Home';
import AllAuctions from './pages/AllAuctions';
import CreateAuction from './pages/CreateAuction';
import MyAuctions from './pages/MyAuctions';
import AdminPanel from './pages/AdminPanel';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import UserProfile from './pages/Profile/UserProfile';
import KYCVerification from './pages/Profile/KYCVerification';

// Import Global CSS
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes - No Header */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Authenticated Routes - With Header */}
              <Route path="/dashboard" element={
                <div>
                  <Header />
                  <main className="main-content">
                    <UserDashboard />
                  </main>
                </div>
              } />
              <Route path="/home" element={
                <div>
                  <Header />
                  <main className="main-content">
                    <Home />
                  </main>
                </div>
              } />
              <Route path="/auctions" element={
                <div>
                  <Header />
                  <main className="main-content">
                    <AllAuctions />
                  </main>
                </div>
              } />
              <Route path="/create-auction" element={
                <div>
                  <Header />
                  <main className="main-content">
                    <CreateAuction />
                  </main>
                </div>
              } />
              <Route path="/my-auctions" element={
                <div>
                  <Header />
                  <main className="main-content">
                    <MyAuctions />
                  </main>
                </div>
              } />
              <Route path="/admin" element={
                <div>
                  <Header />
                  <main className="main-content">
                    <AdminDashboard />
                  </main>
                </div>
              } />
              <Route path="/admin/users" element={
                <div>
                  <Header />
                  <main className="main-content">
                    <AdminPanel />
                  </main>
                </div>
              } />
              <Route path="/admin/analytics" element={
                <div>
                  <Header />
                  <main className="main-content">
                    <AdminPanel />
                  </main>
                </div>
              } />
              <Route path="/profile" element={
                <div>
                  <Header />
                  <main className="main-content">
                    <UserProfile />
                  </main>
                </div>
              } />
              <Route path="/profile/kyc" element={
                <div>
                  <Header />
                  <main className="main-content">
                    <KYCVerification />
                  </main>
                </div>
              } />
            </Routes>
          </div>
        </Router>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;
