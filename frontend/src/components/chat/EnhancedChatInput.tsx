import React, { useState, useEffect, useRef } from 'react';

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholders?: string[];
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({ 
  onSendMessage, 
  isLoading,
  placeholders = [
    "I'm planning a corporate conference for 200 people",
    "I need to organize a wedding for 150 guests",
    "We're hosting a trade show and need venue options",
    "I'm looking for a venue for a team retreat",
    "We need a space for our annual company meeting"
  ]
}) => {
  const [message, setMessage] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Rotate through placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder(prev => (prev + 1) % placeholders.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [placeholders.length]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="relative w-full max-w-xl mx-auto">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
          className="w-full h-12 pl-4 pr-12 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          placeholder={placeholders[currentPlaceholder]}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-500 dark:bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-600"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default EnhancedChatInput; 