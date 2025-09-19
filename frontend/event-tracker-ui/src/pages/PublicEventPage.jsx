/**
 * Public Event page for shared event links.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  DocumentTextIcon,
  UserIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { format, isAfter } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function PublicEventPage() {
  const { shareId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicEvent();
  }, [shareId]);

  const fetchPublicEvent = async () => {
    try {
      const response = await api.get(`/public/events/${shareId}/`);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Failed to fetch public event:', error);
      setError('Event not found or link is invalid');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Event Not Found</h2>
          <p className="mt-2 text-gray-600">
            {error || 'The shared event link is invalid or has expired.'}
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Event Tracker
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isUpcoming = isAfter(new Date(event.date_time), new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shared Event</h1>
              <p className="text-gray-600">Public event details</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </button>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Your Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {/* Event Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
                <div className="flex items-center text-blue-100">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>Organized by {event.user?.first_name} {event.user?.last_name}</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                isUpcoming 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isUpcoming ? 'Upcoming' : 'Past Event'}
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center text-gray-700 mb-3">
                    <ClockIcon className="h-6 w-6 mr-3 text-blue-600" />
                    <span className="font-semibold text-lg">When</span>
                  </div>
                  <div className="ml-9">
                    <p className="text-xl font-medium text-gray-900">
                      {format(new Date(event.date_time), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-lg text-gray-600">
                      {format(new Date(event.date_time), 'h:mm a')}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center text-gray-700 mb-3">
                    <MapPinIcon className="h-6 w-6 mr-3 text-blue-600" />
                    <span className="font-semibold text-lg">Where</span>
                  </div>
                  <div className="ml-9">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {event.location}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Event Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        isUpcoming ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {isUpcoming ? 'Upcoming Event' : 'Past Event'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-900">
                        {format(new Date(event.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {event.updated_at !== event.created_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Updated:</span>
                        <span className="text-gray-900">
                          {format(new Date(event.updated_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            {event.description && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center text-gray-700 mb-4">
                  <DocumentTextIcon className="h-6 w-6 mr-3 text-blue-600" />
                  <span className="font-semibold text-lg">About This Event</span>
                </div>
                <div className="ml-9">
                  <div className="prose max-w-none">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Want to create and manage your own events?
          </h3>
          <p className="text-blue-700 mb-4">
            Join Event Tracker to organize your events, share them with others, and keep track of everything in one place.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}