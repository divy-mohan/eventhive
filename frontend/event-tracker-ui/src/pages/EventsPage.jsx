// Events page - main event management interface with search and filtering
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { format, isAfter, isBefore } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function EventsPage() {
  // Main state for events and UI controls
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // Filter options: all, upcoming, past
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load user's events when page first loads
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch all events for the current user
  const fetchEvents = async () => {
    try {
      const response = await api.get('/events/');
      // Handle both paginated and non-paginated responses
      const eventsData = response.data.results || response.data;
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Show user-friendly error message
      toast.error('Failed to load events');
      setEvents([]);
    } finally {
      // Always stop loading, even if request failed
      setLoading(false);
    }
  };

  const handleShare = async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/generate_share_link/`);
      const shareUrl = response.data.share_url;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Event Share',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to generate share link:', error);
      toast.error('Failed to generate share link');
    }
  };

  const filteredEvents = useMemo(() => {
    const now = new Date();
    
    return events.filter(event => {
      const eventDate = new Date(event.date_time);
      
      // Apply filter
      let matchesFilter = true;
      if (filter === 'upcoming') {
        matchesFilter = isAfter(eventDate, now);
      } else if (filter === 'past') {
        matchesFilter = isBefore(eventDate, now);
      }
      
      // Apply search
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesFilter && matchesSearch;
    });
  }, [events, filter, searchTerm]);

  const getEventStatus = (eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    return isAfter(event, now) ? 'upcoming' : 'past';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">My Events</h1>
              <p className="mt-3 text-lg text-gray-600">
                Manage and organize all your events in one place ✨
              </p>
            </div>
            <div className="mt-6 sm:mt-0">
              <Link
                to="/events/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                New Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-purple-500" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 focus:bg-white transition-all duration-200"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-6 py-3 border border-purple-200 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all duration-200"
            >
              <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
              Filters
            </button>
          </div>
        </div>
        
        {/* Filter Options */}
        {showFilters && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Filter by:</h4>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: 'All Events', color: 'blue' },
                { key: 'upcoming', label: 'Upcoming', color: 'green' },
                { key: 'past', label: 'Past Events', color: 'purple' }
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    filter === key
                      ? `bg-${color}-100 text-${color}-800 ring-2 ring-${color}-200`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => {
            const status = getEventStatus(event.date_time);
            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                          <ClockIcon className="h-4 w-4 text-white" />
                        </div>
                        {format(new Date(event.date_time), 'MMM d, yyyy • h:mm a')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <MapPinIcon className="h-4 w-4 text-white" />
                        </div>
                        {event.location}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      status === 'upcoming' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                        : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800'
                    }`}>
                      {status === 'upcoming' ? '🔥 Upcoming' : '✅ Past'}
                    </span>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-6 line-clamp-2 bg-gray-50 p-3 rounded-lg">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Link
                      to={`/events/${event.id}`}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleShare(event.id)}
                      className="inline-flex items-center text-gray-400 hover:text-purple-600 transition-colors p-2 hover:bg-purple-50 rounded-lg"
                      title="Share event"
                    >
                      <ShareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || filter !== 'all' ? 'No events found' : 'No events yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first event'
            }
          </p>
          {!searchTerm && filter === 'all' && (
            <div className="mt-6">
              <Link
                to="/events/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Create Event
              </Link>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}