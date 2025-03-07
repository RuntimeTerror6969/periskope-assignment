'use client';

import { format } from 'date-fns';
import { Message as MessageType } from '@/types';

interface MessageProps {
  message: MessageType;
  isSent: boolean;
  showSender?: boolean;
  senderName?: string;
}

export default function Message({ message, isSent, showSender = false, senderName = '' }: MessageProps) {
  const formattedTime = format(new Date(message.timestamp), 'h:mm a, dd MMM');

  return (
    <div className={`mb-1 ${isSent ? 'text-right' : 'text-left'}`}>
      {showSender && !isSent && (
        <p className="text-sm font-semibold text-gray-700 mb-1">{senderName}</p>
      )}
      <div className={`inline-block rounded-md px-3 py-2 max-w-[75%] ${
        isSent ? 'bg-green-500 text-white ml-auto' : 'bg-gray-200 text-black'
      }`}>
        <p>{message.content}</p>
        <p className="text-xs mt-1 opacity-75">{formattedTime}</p>
      </div>
    </div>
  );
}