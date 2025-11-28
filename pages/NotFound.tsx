import React from 'react';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '../components/UI';

const NotFound = ({ onGoHome }: { onGoHome: () => void }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        Sorry, the page you are looking for doesn't exist or you don't have permission to access it.
      </p>
      <Button onClick={onGoHome} size="lg">
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;