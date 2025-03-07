'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFaceSmile, 
  faPaperPlane,
  faMagnifyingGlass, 
  faArrowLeft,
  faAt,
  faMicrophone,
  faImage,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import { Message as MessageType, User } from '@/types';
import MessageGroup from './MessageGroup';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface MainChatAreaProps {
  selectedChatId: string | null;
  selectedChatName: string | null;
  currentUser: User | null;
  onBackClick?: () => void;
}

export default function MainChatArea({ selectedChatId, selectedChatName, currentUser, onBackClick }: MainChatAreaProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!selectedChatId || !currentUser) return;
  
    const fetchMessages = async () => {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', selectedChatId)
        .single();
  
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }
  
      setOtherUser(userData);
  
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedChatId}),and(sender_id.eq.${selectedChatId},receiver_id.eq.${currentUser.id})`)
        .order('timestamp', { ascending: true });
  
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
  
      setMessages(data || []);
  
      const unreadMessageIds = (data || [])
        .filter((m) => m.receiver_id === currentUser.id && !m.read)
        .map((m) => m.id);
  
      if (unreadMessageIds.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadMessageIds);
        if (updateError) console.error('Error marking messages as read:', updateError);
      }
  
      setTimeout(scrollToBottom, 100);
    };
  
    fetchMessages();
  
    const channelName = `chat:${[currentUser.id, selectedChatId].sort().join('-')}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as MessageType;
          if (
            (newMessage.sender_id === currentUser.id && newMessage.receiver_id === selectedChatId) ||
            (newMessage.sender_id === selectedChatId && newMessage.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, newMessage]);
            setTimeout(scrollToBottom, 100);
            if (newMessage.receiver_id === currentUser.id && !newMessage.read) {
              supabase
                .from('messages')
                .update({ read: true })
                .eq('id', newMessage.id)
                .then(({ error }) => {
                  if (error) console.error('Error marking message as read:', error);
                });
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedChatId, currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedChatId) return;
  
    const newMessageObj = {
      sender_id: currentUser.id,
      receiver_id: selectedChatId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };
  
    const { error } = await supabase.from('messages').insert([newMessageObj]);
  
    if (error) {
      console.error('Error sending message:', error);
    }
  
    setNewMessage('');
  };

  // Group messages by sender and filter if searching
  const groupedMessages: MessageType[][] = [];
  let currentGroup: MessageType[] = [];
  let currentSenderId = '';

  const filteredMessages = searchQuery
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  filteredMessages.forEach((message) => {
    if (message.sender_id !== currentSenderId) {
      if (currentGroup.length > 0) {
        groupedMessages.push([...currentGroup]);
      }
      currentGroup = [message];
      currentSenderId = message.sender_id;
    } else {
      currentGroup.push(message);
    }
  });

  if (currentGroup.length > 0) {
    groupedMessages.push(currentGroup);
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-x-hidden">
      {/* Chat header */}
      <div className="py-2 px-3 border-b flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {onBackClick && (
            <button 
              onClick={onBackClick} 
              className="md:hidden text-gray-500 p-2 -ml-2"
              aria-label="Back to chat list"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          )}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {otherUser?.profile_url ? (
              <Image 
                src={otherUser.profile_url} 
                alt={selectedChatName || ''} 
                width={40} 
                height={40} 
                className="rounded-full"
              />
            ) : (
              <span className="text-gray-500 font-medium">
                {selectedChatName?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-base">{selectedChatName || 'Select a chat'}</h2>
            {selectedChatId && (
              <p className="text-xs text-gray-500">
                {otherUser?.status || 'Last seen recently'}
              </p>
            )}
          </div>
        </div>
        
        {/* Search button */}
        <div className="flex items-center">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="Search messages"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
        </div>
      </div>

      {/* Search input (shown when search is active) */}
      {showSearch && (
        <div className="p-2 bg-white border-b">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400 text-sm mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages"
              className="bg-transparent border-none focus:outline-none text-sm flex-1"
            />
            {searchQuery && (
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="text-gray-400 text-sm cursor-pointer"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearch(false);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Messages area with overflow control */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-gray-50 w-full">
        {selectedChatId ? (
          <>
            {groupedMessages.length > 0 ? (
              groupedMessages.map((group, index) => (
                <MessageGroup
                  key={index}
                  messages={group}
                  isSent={group[0].sender_id === currentUser?.id}
                  senderName={group[0].sender_id === currentUser?.id ? currentUser?.name : otherUser?.name || ''}
                />
              ))
            ) : (
              searchQuery && (
                <div className="text-gray-500 text-center">No matching messages found</div>
              )
            )}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-2 border-t bg-white">
        <form onSubmit={handleSendMessage}>
          <div className="flex w-full mb-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message"
              className="flex-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
              disabled={!selectedChatId}
            />
            <button
              type="submit"
              disabled={!selectedChatId || !newMessage.trim()}
              className={`ml-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-50 ${!newMessage.trim() ? 'opacity-50' : ''}`}
            >
              <FontAwesomeIcon icon={faPaperPlane} size="sm" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-8 text-gray-500">
              <button type="button" className="hover:text-gray-700">
                <FontAwesomeIcon icon={faFaceSmile} />
              </button>
              <button type="button" className="hover:text-gray-700">
                <FontAwesomeIcon icon={faAt} />
              </button>
              <button type="button" className="hover:text-gray-700">
                <FontAwesomeIcon icon={faImage} />
              </button>
              <button type="button" className="hover:text-gray-700">
                <FontAwesomeIcon icon={faMicrophone} />
              </button>
            </div>
            <div className="flex items-center text-xs text-green-500 font-medium">
              <FontAwesomeIcon icon={faCircle} className="text-green-500 mr-1" size="xs" />
              <FontAwesomeIcon icon={faCircle} className="text-green-500 mr-1" size="xs" />
              <span>Periscope</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}