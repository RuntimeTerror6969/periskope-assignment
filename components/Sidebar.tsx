'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEllipsisVertical,
  faBell, faQuestionCircle,
  faFilter, faXmark, faHome, faUsers, faList, faCog, faSearch,
  faPhone, faVideo, faMessage, faFileLines,
  faImage, faPlus, faAngleDown, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import ChatListItem from './ChatListItem';
import { supabase } from '@/lib/supabase';
import { Chat, User, Message } from '@/types';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string, chatName: string) => void;
  currentUser: User | null;
}

export default function Sidebar({ selectedChatId, onSelectChat, currentUser }: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]);

  const fetchUsersAndChats = async () => {
    if (!currentUser) return;
  
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUser.id)
      .order('name', { ascending: true });
  
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
  
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order('timestamp', { ascending: false });
  
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return;
    }
  
    const chatList: Chat[] = users.map((user) => {
      const userMessages = messages?.filter(
        (m) =>
          (m.sender_id === currentUser.id && m.receiver_id === user.id) ||
          (m.sender_id === user.id && m.receiver_id === currentUser.id)
      ) || [];
      const latestMessage = userMessages[0];
      const unreadCount = userMessages.filter(
        (m) => m.sender_id === user.id && m.receiver_id === currentUser.id && !m.read
      ).length;
  
      return {
        id: user.id,
        name: user.name,
        lastMessage: latestMessage?.content || 'No messages yet',
        timestamp: latestMessage?.timestamp || user.created_at || new Date().toISOString(),
        label: latestMessage ? 'RECENT' : 'NEW',
        unreadCount,
      };
    });
  
    chatList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setChats(chatList);
  };

  useEffect(() => {
    fetchUsersAndChats();
    
    if (!currentUser) return;
  
    const messagesChannel = supabase
      .channel('messages-all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
  
          setChats((prevChats) => {
            const otherUserId =
              newMessage.sender_id === currentUser.id
                ? newMessage.receiver_id
                : newMessage.sender_id;
  
            const chatIndex = prevChats.findIndex((chat) => chat.id === otherUserId);
            if (chatIndex === -1) {
              fetchUsersAndChats();
              return prevChats;
            }
  
            const updatedChats = [...prevChats];
            const chat = updatedChats[chatIndex];
            updatedChats[chatIndex] = {
              ...chat,
              lastMessage: newMessage.content,
              timestamp: newMessage.timestamp,
              unreadCount:
                newMessage.receiver_id === currentUser.id && !newMessage.read
                  ? chat.unreadCount + 1
                  : chat.unreadCount,
            };
  
            return updatedChats.sort((a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });
        }
      )
      .subscribe();
  
    const usersChannel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchUsersAndChats();
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(usersChannel);
    };
  }, [currentUser]);

  const filteredChats = searchQuery 
    ? chats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="h-full flex w-full">
      {/* Vertical navigation sidebar */}
      <div className={`bg-white ${isMobileView && !showNavMenu ? 'hidden' : 'w-16'} flex flex-col items-center py-4 flex-shrink-0`}>
        <div className="flex flex-col space-y-6 items-center">
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">
            <FontAwesomeIcon icon={faHome} className="text-lg" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-white bg-green-500 rounded-full">
            <FontAwesomeIcon icon={faMessage} className="text-sm" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">
            <FontAwesomeIcon icon={faUsers} className="text-lg" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">
            <FontAwesomeIcon icon={faFileLines} className="text-lg" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">
            <FontAwesomeIcon icon={faImage} className="text-lg" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">
            <FontAwesomeIcon icon={faList} className="text-lg" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">
            <div className="relative">
              <FontAwesomeIcon icon={faBell} className="text-lg" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          </button>
        </div>
        <div className="mt-auto flex flex-col space-y-6 items-center relative" ref={settingsRef}>
          <button 
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full"
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          >
            <FontAwesomeIcon icon={faCog} className="text-lg" />
          </button>
          {showSettingsMenu && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-md shadow-lg w-32 z-10">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleSignOut}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Sign Out
              </button>
            </div>
          )}
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full">
            <FontAwesomeIcon icon={faQuestionCircle} className="text-lg" />
          </button>
        </div>
      </div>

      {/* Chat list sidebar */}
      <div className="h-full flex flex-col bg-gray-100 flex-1 relative">
        {/* Top header */}
        <div className="p-4 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            {isMobileView && (
              <button 
                onClick={() => setShowNavMenu(!showNavMenu)}
                className="mr-2 text-gray-500"
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            )}
            <span className="text-sm font-medium">Chats</span>
            <FontAwesomeIcon icon={faAngleDown} className="text-gray-500 text-xs" />
          </div>
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faPhone} className="text-gray-500 text-sm" />
            <FontAwesomeIcon icon={faVideo} className="text-gray-500 text-sm" />
            <FontAwesomeIcon icon={faEllipsisVertical} className="text-gray-500 text-sm" />
          </div>
        </div>

        {/* Filter section */}
        <div className="p-3 flex flex-wrap gap-2 bg-gray-50">
          <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span>Custom Filter</span>
            {isFiltered && <FontAwesomeIcon icon={faFilter} className="text-xs" />}
          </button>
          {isFiltered && (
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <span>Filtered</span>
              <FontAwesomeIcon icon={faXmark} className="text-xs cursor-pointer" onClick={() => setIsFiltered(false)} />
            </div>
          )}
          <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium" onClick={() => setShowSearch(!showSearch)}>
            <div className="flex items-center gap-1">
              <FontAwesomeIcon icon={faSearch} className="text-xs" />
              <span>Search</span>
            </div>
          </button>
          <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
            Save
          </button>
        </div>

        {/* Search input */}
        {showSearch && (
          <div className="p-2 bg-white">
            <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm mr-2" />
              <input 
                type="text" 
                placeholder="Search conversations" 
                className="bg-transparent border-none focus:outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <FontAwesomeIcon 
                  icon={faXmark} 
                  className="text-gray-400 text-sm cursor-pointer" 
                  onClick={() => setSearchQuery('')}
                />
              )}
            </div>
          </div>
        )}

        {/* Chat list wrapper with button */}
        <div className="flex-1 relative">
          {/* Chat list */}
          <div className="h-full overflow-y-auto">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChatId === chat.id}
                  onClick={() => onSelectChat(chat.id, chat.name)}
                />
              ))
            ) : (
              <div className="p-4 text-gray-500 text-center">
                {searchQuery ? 'No matching conversations' : 'No users available'}
              </div>
            )}
          </div>

          {/* Floating action button */}
          <button 
            className="absolute bottom-4 right-4 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        {/* User profile */}
        <div className="p-3 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-xs font-medium">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="font-medium text-sm truncate">{currentUser?.name || 'User'}</span>
          </div>
          <div className="flex space-x-3">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500 text-sm" />
            <FontAwesomeIcon icon={faEllipsisVertical} className="text-gray-500 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}