/**
 * Event Detail page with editing and sharing capabilities.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { format, isAfter } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}/`);
      setEvent(response.data);
      setEditData({
        title: response.data.title,
        date_time: response.data.date_time.slice(0, 16), // Format for datetime-local
        location: response.data.location,
        description: response.data.description || '',
      });
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast.error('Failed to load event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/events/${id}/`);
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      const response = await api.post(`/events/${id}/generate_share_link/`);
      const shareUrl = response.data.share_url;
      
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put(`/events/${id}/`, editData);
      setEvent(response.data.event);
      setEditing(false);
      toast.success('Event updated successfully!');
    } catch (error) {
      console.error('Failed to update event:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        toast.error('Failed to update event');
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Event not found</h2>
            <p className="text-lg text-gray-600 mb-8">The event you're looking for doesn't exist.</p>
            <Link 
              to="/events" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isUpcoming = isAfter(new Date(event.date_time), new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              to="/events"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Events
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{event.title}</h1>
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                    isUpcoming 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                      : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800'
                  }`}>
                    {isUpcoming ? '🔥 Upcoming' : '✅ Past Event'}
                  </span>
                </div>
                <p className="text-lg text-gray-600">Event details and management ✨</p>
              </div>
              
              <div className="flex items-center gap-3 mt-6 lg:mt-0">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-all duration-200"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </button>
                <button
                  onClick={() => setEditing(!editing)}
                  className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-all duration-200"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {editing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-all duration-200 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden">
          {editing ? (
            <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.title ? 'border-red-300' : ''}`}
                />
                {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Date & Time</label>
                <input
                  type="datetime-local"
                  name="date_time"
                  value={editData.date_time}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.date_time ? 'border-red-300' : ''}`}
                />
                {errors.date_time && <p className="mt-2 text-sm text-red-600">{errors.date_time}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Location</label>
                <textarea
                  name="location"
                  rows={3}
                  value={editData.location}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.location ? 'border-red-300' : ''}`}
                />
                {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={editData.description}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8">
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
                    <div className="flex items-center text-purple-700 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                        <ClockIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-lg">Date & Time</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {format(new Date(event.date_time), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-xl text-purple-600 font-semibold">
                      {format(new Date(event.date_time), 'h:mm a')}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl">
                    <div className="flex items-center text-green-700 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                        <MapPinIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-lg">Location</span>
                    </div>
                    <p className="text-lg text-gray-900 whitespace-pre-wrap">{event.location}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
                  <div className="flex items-center text-purple-700 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg">Event Details</span>
                  </div>
                  <div className="space-y-3 text-gray-700">
                    <p><span className="font-semibold">Created:</span> {format(new Date(event.created_at), 'MMM d, yyyy')}</p>
                    <p><span className="font-semibold">Last updated:</span> {format(new Date(event.updated_at), 'MMM d, yyyy')}</p>
                    <p><span className="font-semibold">Status:</span> <span className={isUpcoming ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                      {isUpcoming ? '🔥 Upcoming' : '✅ Past Event'}
                    </span></p>
                  </div>
                </div>
              </div>
              
              {event.description && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl">
                    <div className="flex items-center text-gray-700 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                        <DocumentTextIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-lg">Description</span>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}