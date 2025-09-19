/**
 * Create Event page with comprehensive form validation.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date_time: '',
    location: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.date_time) {
      newErrors.date_time = 'Date and time are required';
    } else {
      const eventDate = new Date(formData.date_time);
      const now = new Date();
      if (eventDate <= now) {
        newErrors.date_time = 'Event must be scheduled for the future';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 5) {
      newErrors.location = 'Location must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/events/', formData);
      toast.success('Event created successfully!');
      navigate(`/events/${response.data.event.id}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      if (error.response?.data) {
        const serverErrors = error.response.data;
        if (typeof serverErrors === 'object') {
          setErrors(serverErrors);
        } else {
          toast.error('Failed to create event');
        }
      } else {
        toast.error('Failed to create event');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get minimum datetime (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            to="/events"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Events
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="mt-2 text-gray-600">
          Fill in the details below to create your event
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="inline h-4 w-4 mr-1" />
              Event Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'form-input-error' : ''}`}
              placeholder="Enter event title (e.g., Team Meeting, Birthday Party)"
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Date and Time */}
          <div>
            <label htmlFor="date_time" className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="inline h-4 w-4 mr-1" />
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="date_time"
              name="date_time"
              value={formData.date_time}
              onChange={handleChange}
              min={getMinDateTime()}
              className={`form-input ${errors.date_time ? 'form-input-error' : ''}`}
            />
            {errors.date_time && (
              <p className="mt-1 text-sm text-red-600">{errors.date_time}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Select when your event will take place
            </p>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="inline h-4 w-4 mr-1" />
              Location
            </label>
            <textarea
              id="location"
              name="location"
              rows={3}
              value={formData.location}
              onChange={handleChange}
              className={`form-input ${errors.location ? 'form-input-error' : ''}`}
              placeholder="Enter event location or address (e.g., Conference Room A, 123 Main St, Online via Zoom)"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <DocumentTextIcon className="inline h-4 w-4 mr-1" />
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              placeholder="Add any additional details about your event..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Provide more context about your event (agenda, requirements, etc.)
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Creating...</span>
                </>
              ) : (
                'Create Event'
              )}
            </button>
            <Link
              to="/events"
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Tips for creating great events:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use clear, descriptive titles that explain what the event is about</li>
          <li>• Include specific location details or online meeting links</li>
          <li>• Add a description with agenda, requirements, or what to expect</li>
          <li>• Double-check the date and time before creating</li>
        </ul>
      </div>
    </div>
  );
}