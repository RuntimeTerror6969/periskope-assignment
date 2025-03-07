import { Message as MessageType } from '@/types';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';

interface MessageGroupProps {
  messages: MessageType[];
  isSent: boolean;
  senderName: string;
}

export default function MessageGroup({ messages, isSent, senderName }: MessageGroupProps) {
  return (
    <div className={`flex flex-col mb-4 ${isSent ? 'items-end' : 'items-start'}`}>
      {messages.map((message, index) => {
        const formattedTime = message.timestamp 
          ? format(new Date(message.timestamp), 'HH:mm')
          : '';

        return (
          <div
            key={index}
            className={`max-w-[75%] mb-1 ${
              isSent
                ? 'bg-green-500 text-white rounded-md'
                : 'bg-white text-gray-800 rounded-md border border-gray-200'
            } p-2 px-3 relative shadow-sm`}
          >
            {/* Sender name for received messages */}
            {!isSent && index === 0 && (
              <div className="text-xs text-green-500 font-medium mb-1">
                {senderName}
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="break-words text-sm mb-1">{message.content}</span>
              <div className={`flex items-center justify-end space-x-1 text-xs ${isSent ? 'text-green-100' : 'text-gray-500'}`}>
                <span>{formattedTime}</span>
                {isSent && (
                  <span className="text-xs">
                    <FontAwesomeIcon icon={faCheckDouble} className="ml-1" />
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}