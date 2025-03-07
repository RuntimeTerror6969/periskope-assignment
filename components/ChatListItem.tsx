import { Chat } from '@/types';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}

export default function ChatListItem({ chat, isSelected, onClick }: ChatListItemProps) {
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div
      className={`flex py-3 px-4 border-b cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
        isSelected ? 'bg-green-100' : ''
      }`}
      onClick={onClick}
    >
      {/* Profile photo */}
      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center mr-3">
        {chat.profileUrl ? (
          <Image 
            src={chat.profileUrl} 
            alt={chat.name} 
            width={40} 
            height={40} 
            className="rounded-full object-cover" 
          />
        ) : (
          <span className="text-gray-500 text-sm md:text-base font-semibold">
            {chat.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Chat info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium text-gray-900 truncate pr-2">{chat.name}</h3>
          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            {formatTimestamp(chat.timestamp)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-sm text-gray-600 truncate break-words">{chat.lastMessage}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {chat.label && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full uppercase text-[10px] hidden sm:inline-block">
                {chat.label}
              </span>
            )}
            {chat.unreadCount > 0 ? (
              <span className="bg-green-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {chat.unreadCount}
              </span>
            ) : (
              <div className="text-gray-400 text-sm">
                <FontAwesomeIcon icon={faCheck} size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}