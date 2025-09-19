import { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Event Tracker! 🚀',
    content: 'Let\'s take a quick tour to help you get started with managing your events.',
    target: null,
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    content: 'This is your dashboard where you can see statistics about your events - total events, upcoming events, and past events.',
    target: '[data-tutorial="dashboard-stats"]',
    position: 'bottom'
  },
  {
    id: 'create-event',
    title: 'Create Your First Event',
    content: 'Click this button to create a new event. You\'ll need to fill in the title, date & time (required), and optionally location and description.',
    target: '[data-tutorial="create-event-btn"]',
    position: 'bottom'
  },
  {
    id: 'navigation',
    title: 'Navigation Menu',
    content: 'Use this navigation to move between Dashboard, Events list, and your Profile.',
    target: '[data-tutorial="navigation"]',
    position: 'bottom'
  },
  {
    id: 'events-list',
    title: 'Managing Events',
    content: 'In the Events section, you can view all your events, search them, filter by upcoming/past, edit, delete, or share events.',
    target: '[data-tutorial="events-nav"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    content: 'You now know the basics of Event Tracker. Start by creating your first event and explore the features!',
    target: null,
    position: 'center'
  }
];

export default function Tutorial({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const step = tutorialSteps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target);
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.style.position = 'relative';
        element.style.zIndex = '1001';
      }
    } else {
      setTargetElement(null);
    }

    return () => {
      if (targetElement) {
        targetElement.style.zIndex = '';
      }
    };
  }, [currentStep, isOpen]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTutorial = () => {
    localStorage.setItem('tutorial-completed', 'true');
    onClose();
  };

  const skipTutorial = () => {
    localStorage.setItem('tutorial-skipped', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const getTooltipPosition = () => {
    if (!targetElement || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1002
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    let top, left;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + 10;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'top':
        top = rect.top - tooltipHeight - 10;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + 10;
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - 10;
        break;
      default:
        top = rect.bottom + 10;
        left = rect.left;
    }

    // Keep tooltip within viewport
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }
    if (top < 10) top = 10;
    if (top + tooltipHeight > window.innerHeight - 10) {
      top = window.innerHeight - tooltipHeight - 10;
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1002
    };
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-1000" />
      
      {/* Highlight target element */}
      {targetElement && (
        <div
          className="fixed border-4 border-blue-500 rounded-lg pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            zIndex: 1001
          }}
        />
      )}

      {/* Tutorial tooltip */}
      <div
        className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-w-sm"
        style={getTooltipPosition()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
            <button
              onClick={closeTutorial}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">{step.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              {isFirstStep && (
                <button
                  onClick={skipTutorial}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  Skip Tour
                </button>
              )}
              
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back
                </button>
              )}
              
              <button
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRightIcon className="h-4 w-4 ml-1" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}