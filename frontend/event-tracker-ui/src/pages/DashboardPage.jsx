// Dashboard page - shows user's event overview and quick stats
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, ClockIcon, PlusIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';

export default function DashboardPage() {
  // Get current user info from auth context
  const { user } = useAuth();
  
  // Track dashboard stats and loading state
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load dashboard stats when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user's event statistics from API
        const response = await api.get('/dashboard/stats/');
        setStats(response.data);
      } catch (error) {
        // Log error but don't crash - dashboard still works without stats
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        // Always stop loading, even if request failed
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Show loading spinner while fetching data
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Personal welcome message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your events
          </p>
        </div>

        {/* Event statistics cards - responsive grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-tutorial="dashboard-stats">
          {/* Total events count */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stats !== null ? (stats?.total_events || 0) : '...'}
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming events count - green icon for positive action */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats !== null ? (stats?.upcoming_events || 0) : '...'}
                </p>
              </div>
            </div>
          </div>

          {/* Past events count - neutral gray for completed items */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Past Events</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stats !== null ? (stats?.past_events || 0) : '...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white opacity-5 rounded-full"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to create your next event? ✨</h3>
                <p className="text-blue-100 text-lg">Get started by adding a new event to your calendar</p>
              </div>
              <Link
                to="/events/new"
                className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                data-tutorial="create-event-btn"
              >
                <PlusIcon className="h-5 w-5" />
                New Event
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Recent Events</h3>
              <Link
                to="/events"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-blue-50 transition-all duration-200"
              >
                View all →
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {stats?.recent_events?.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_events.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-md border border-gray-100 hover:border-blue-200 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <CalendarIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{event.title}</h4>
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-1 text-blue-500" />
                        {format(new Date(event.date_time), 'MMM d, yyyy • h:mm a')}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-1 text-purple-500" />
                        {event.location}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Link
                        to={`/events/${event.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-md"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                  <CalendarIcon className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Event Tracker!</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't created any events yet. Start organizing your schedule by creating your first event.
                </p>
                
                <div className="space-y-4">
                  <Link
                    to="/events/new"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Create Your First Event
                  </Link>
                  
                  <div className="text-sm text-gray-500">
                    <p>💡 <strong>Quick tip:</strong> Events help you organize meetings, appointments, and important dates</p>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Create Events</h4>
                    </div>
                    <p className="text-sm text-gray-600">Add title, date, time, and location for your events</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <ClockIcon className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Track Time</h4>
                    </div>
                    <p className="text-sm text-gray-600">See upcoming and past events at a glance</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <MapPinIcon className="h-5 w-5 text-purple-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Share Events</h4>
                    </div>
                    <p className="text-sm text-gray-600">Generate links to share events with others</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}