'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from './Sidebar';
import MainChatArea from './MainChatArea';
import { User } from '@/types';

export default function Layout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showChatList, setShowChatList] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Handle responsive state
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // In mobile view, selecting a chat should hide the chat list
    if (isMobileView && selectedChatId) {
      setShowChatList(false);
    }
  }, [selectedChatId, isMobileView]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error || !sessionData.session) {
        router.push('/login');
        return;
      }
      
      const authUser = sessionData.session.user;
      const userEmail = authUser.email || '';
      const userName = userEmail.split('@')[0];
      
      const { data: userData, error: upsertError } = await supabase
        .from('users')
        .upsert(
          { id: authUser.id, name: userName, email: userEmail },
          { onConflict: 'id' }
        )
        .select()
        .single();
        
      if (upsertError) {
        console.error('Error upserting user:', upsertError);
        return;
      }
      
      setCurrentUser(userData);
    };
    
    fetchCurrentUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleSelectChat = (chatId: string, chatName: string) => {
    setSelectedChatId(chatId);
    setSelectedChatName(chatName);
  };

  const handleBackToList = () => {
    setShowChatList(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      {/* Mobile/Desktop layout handling */}
      {isMobileView ? (
        // Mobile layout (full width, toggle between views)
        <>
          {showChatList ? (
            // Show chat list on mobile
            <div className="w-full h-full">
              <Sidebar 
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
                currentUser={currentUser}
              />
            </div>
          ) : (
            // Show chat area on mobile
            <div className="w-full h-full">
              <MainChatArea
                selectedChatId={selectedChatId}
                selectedChatName={selectedChatName}
                currentUser={currentUser}
                onBackClick={handleBackToList}
              />
            </div>
          )}
        </>
      ) : (
        // Desktop layout (side by side)
        <>
          {/* Sidebar with fluid width */}
          <div className="w-1/3 max-w-sm h-full">
            <Sidebar 
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              currentUser={currentUser}
            />
          </div>
          
          {/* MainChatArea takes remaining space */}
          <div className="flex-1 h-full">
            <MainChatArea
              selectedChatId={selectedChatId}
              selectedChatName={selectedChatName}
              currentUser={currentUser}
            />
          </div>
        </>
      )}
    </div>
  );
}