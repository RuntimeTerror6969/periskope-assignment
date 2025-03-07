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
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
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
      {isMobileView ? (
        <>
          {showChatList ? (
            <div className="w-full h-full">
              <Sidebar 
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
                currentUser={currentUser}
              />
            </div>
          ) : (
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
        <>
          {/* Sidebar with 40% width */}
          <div className="w-2/5 h-full overflow-x-hidden">
            <Sidebar 
              selectedChatId={selectedChatId}
              onSelectChat={handleSelectChat}
              currentUser={currentUser}
            />
          </div>
          
          {/* MainChatArea with 60% width */}
          <div className="w-3/5 h-full">
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