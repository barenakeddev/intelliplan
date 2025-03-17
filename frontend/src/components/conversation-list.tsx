import { useState } from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

export interface Conversation {
  id: string;
  name: string;
  snippet: string;
  createdAt: string;
}

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export default function ConversationList({ onSelectConversation, onNewConversation }: ConversationListProps) {
  // Mock data for conversations - would typically come from API
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      name: "Corporate Conference 2024",
      snippet: "Planning a corporate conference for 200 people",
      createdAt: "2023-06-15T10:30:00Z",
    },
    {
      id: "2",
      name: "Wedding Planning",
      snippet: "Planning a wedding for 150 guests",
      createdAt: "2023-06-10T14:20:00Z",
    },
    {
      id: "3",
      name: "Charity Gala",
      snippet: "Organizing a fundraising gala",
      createdAt: "2023-06-05T09:15:00Z",
    },
  ]);

  return (
    <div className="w-full md:w-[450px] flex flex-col bg-gray-50 border-r">
      {/* Conversation List Header */}
      <div className="p-4 border-b flex items-center">
        <h2 className="text-lg font-medium flex-1 text-center">Conversations</h2>
        <Button 
          onClick={onNewConversation}
          size="icon"
          className="bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className="p-4 border-b hover:bg-gray-100 cursor-pointer"
          >
            <h3 className="font-medium">{conversation.name}</h3>
            <p className="text-sm text-gray-500 mt-1 truncate">{conversation.snippet}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(conversation.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}

        {conversations.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No conversations yet</p>
            <Button 
              onClick={onNewConversation} 
              className="mt-4 bg-purple-600 hover:bg-purple-700"
            >
              Start a new conversation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 