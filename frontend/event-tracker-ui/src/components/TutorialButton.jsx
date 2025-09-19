import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function TutorialButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
      title="Show Tutorial"
    >
      <QuestionMarkCircleIcon className="h-6 w-6" />
    </button>
  );
}