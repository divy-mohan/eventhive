/**
 * Main App component for Event Tracker.
 * 
 * Root component that sets up routing, authentication,
 * and global providers for the entire application.
 * 
 * Author: Generated for Mini Event Tracker
 * Created: September 16, 2025
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import QueryProvider from './contexts/QueryProvider';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import Tutorial from './components/Tutorial';
import TutorialButton from './components/TutorialButton';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailPage from './pages/EventDetailPage';
import PublicEventPage from './pages/PublicEventPage';

/**
 * Protected Route component - requires authentication
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Public Route component - redirects to dashboard if authenticated
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * App content with routing
 */
function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const tutorialCompleted = localStorage.getItem('tutorial-completed');
      const tutorialSkipped = localStorage.getItem('tutorial-skipped');
      if (!tutorialCompleted && !tutorialSkipped) {
        setTimeout(() => setShowTutorial(true), 1000);
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          
          {/* Public event sharing */}
          <Route path="/events/shared/:shareId" element={<PublicEventPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/new"
            element={
              <ProtectedRoute>
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      {isAuthenticated && <TutorialButton onClick={() => setShowTutorial(true)} />}
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Developer Info */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Developer
              </h3>
              <button
                onClick={() => window.open('https://wa.me/919506933715', '_blank')}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>Divya Mohan Singh</span>
              </button>
            </div>

            {/* Live Projects */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Live Projects for Clients
              </h3>
              <div className="space-y-3">
                <div className="group">
                  <div className="flex items-center space-x-2 mb-1">
                    <button onClick={() => window.open('https://www.foundrfuse.com/', '_blank')} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors">
                      Visit
                    </button>
                    <span className="text-sm font-semibold text-blue-300">🚀 FoundrFuse</span>
                  </div>
                  <p className="text-xs text-gray-400">Real-time chat platform with advanced messaging features</p>
                </div>
                <div className="group">
                  <div className="flex items-center space-x-2 mb-1">
                    <button onClick={() => window.open('https://professionalwriters.in/', '_blank')} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors">
                      Visit
                    </button>
                    <span className="text-sm font-semibold text-green-300">✍️ Professional Writers</span>
                  </div>
                  <p className="text-xs text-gray-400">Multi-user chat assistance with location & page detection</p>
                </div>
                <div className="group">
                  <div className="flex items-center space-x-2 mb-1">
                    <button onClick={() => window.open('https://vedmatawebdesigning.pythonanywhere.com/', '_blank')} className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs transition-colors">
                      Visit
                    </button>
                    <span className="text-sm font-semibold text-orange-300">🧳 Neem Karoli Travellers</span>
                  </div>
                  <p className="text-xs text-gray-400">Travel website with automatic rate calculations</p>
                </div>
                <div className="group">
                  <div className="flex items-center space-x-2 mb-1">
                    <button onClick={() => window.open('https://www.swastinaturals.com/', '_blank')} className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs transition-colors">
                      Visit
                    </button>
                    <span className="text-sm font-semibold text-purple-300">🛒 Swasti Naturals</span>
                  </div>
                  <p className="text-xs text-gray-400">Complete eCommerce solution for natural products</p>
                </div>
                <div className="group">
                  <div className="flex items-center space-x-2 mb-1">
                    <button onClick={() => window.open('https://uppyp.in/', '_blank')} className="bg-cyan-500 hover:bg-cyan-600 text-white px-2 py-1 rounded text-xs transition-colors">
                      Visit
                    </button>
                    <span className="text-sm font-semibold text-cyan-300">🏢 UPPYP Organization</span>
                  </div>
                  <p className="text-xs text-gray-400">Professional organization website with modern design</p>
                </div>
              </div>
            </div>

            {/* AI Projects */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Projects
              </h3>
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 rounded-lg border border-purple-500/30">
                <a 
                  href="https://web-production-f281c.up.railway.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg mb-3"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>Face Recognition System</span>
                </a>
                <div className="text-xs text-gray-300 space-y-1">
                  <p>🔍 Advanced blink detection technology</p>
                  <p>📍 Real-time location tracking</p>
                  <p>🔐 Secure authentication system</p>
                  <div className="bg-gray-800/50 p-2 rounded mt-2 border border-gray-600">
                    <p className="text-yellow-300 font-mono">Demo Credentials:</p>
                    <p>ID: IT_Supervisor</p>
                    <p>Pass: Admin123#</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} All rights reserved • Built by Divya Mohan Singh (Vedmata Web Designing) • Self-Hosted Freelancing Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Root App component with all providers
 */
export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <AppContent />
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryProvider>
  );
}