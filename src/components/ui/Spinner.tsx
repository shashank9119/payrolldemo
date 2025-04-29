import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
};

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} rounded-full border-blue-600 border-t-transparent animate-spin`}
      ></div>
    </div>
  );
};

export default Spinner;