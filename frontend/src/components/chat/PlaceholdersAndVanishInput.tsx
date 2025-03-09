import React, { useState, useEffect, useRef } from 'react';

interface PlaceholdersAndVanishInputProps {
  placeholders: string[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  className?: string;
}

const PlaceholdersAndVanishInput: React.FC<PlaceholdersAndVanishInputProps> = ({
  placeholders,
  onSendMessage,
  isLoading,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Rotate through placeholders
  useEffect(() => {
    if (!isFocused && inputValue === '') {
      const interval = setInterval(() => {
        setCurrentPlaceholder(prev => (prev + 1) % placeholders.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [placeholders.length, isFocused, inputValue]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          placeholder={placeholders[currentPlaceholder]}
          className="w-full h-12 pl-5 pr-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-300 ease-in-out"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading && inputValue.trim()) {
              e.preventDefault();
              onSendMessage(inputValue);
              setInputValue('');
            }
          }}
        />
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <div className={`w-0 h-6 border-l-2 border-blue-500 dark:border-blue-400 transition-opacity duration-300 ${isFocused || inputValue ? 'opacity-100' : 'opacity-0'}`}></div>
        </div>
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          onClick={handleSubmit}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:scale-110"
          >
            <path d="M22 2L11 13"></path>
            <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PlaceholdersAndVanishInput; 