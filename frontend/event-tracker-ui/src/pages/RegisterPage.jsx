/**
 * Basic Registration page component.
 */

import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Registration form coming soon
          </p>
        </div>
        <div className="text-center">
          <Link to="/login" className="text-primary-600 hover:text-primary-500">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}