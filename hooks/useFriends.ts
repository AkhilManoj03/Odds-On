import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  friends: string[];
}

export function useFriends() {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useFriends hook initialized');
    loadFriends();

    // Subscribe to changes in users table
    const friendsSubscription = supabase
      .channel('friends_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users',
      }, () => {
        console.log('User change detected, reloading friends');
        loadFriends();
      })
      .subscribe();

    return () => {
      friendsSubscription.unsubscribe();
    };
  }, []);

  const loadFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current user's friends array
      const { data: currentUser } = await supabase
        .from('users')
        .select('friends')
        .eq('id', user.id)
        .single();

      const friendIds = currentUser?.friends || [];
      
      if (friendIds.length === 0) {
        setFriends([]);
        return;
      }

      // Get friend details
      const { data: friendUsers, error } = await supabase
        .from('users')
        .select('id, email')
        .in('id', friendIds);

      if (error) throw error;

      setFriends(friendUsers || []);
    } catch (error) {
      console.error('Error loading friends:', error);
      throw error;
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current user's friends array
      const { data: currentUser } = await supabase
        .from('users')
        .select('friends')
        .eq('id', user.id)
        .single();

      const currentFriends = currentUser?.friends || [];

      // Search users by email
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email')
        .neq('id', user.id) // Exclude current user
        .not('id', 'in', `(${currentFriends.join(',')})`) // Exclude current friends
        .ilike('email', `%${query}%`);

      if (error) throw error;

      return users || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  };

  const addFriend = async (friendId: string) => {
    console.log('Adding friend:', friendId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Not authenticated');
      throw new Error('Not authenticated');
    }

    // Get current user's friends array
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('friends')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error getting user data:', userError);
      throw userError;
    }

    // Get friend's friends array
    const { data: friendData, error: friendError } = await supabase
      .from('users')
      .select('friends')
      .eq('id', friendId)
      .single();

    if (friendError) {
      console.error('Error getting friend data:', friendError);
      throw friendError;
    }

    // Update both users' friends arrays
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ friends: [...(userData.friends || []), friendId] })
      .eq('id', user.id);

    if (updateUserError) {
      console.error('Error updating user friends:', updateUserError);
      throw updateUserError;
    }

    const { error: updateFriendError } = await supabase
      .from('users')
      .update({ friends: [...(friendData.friends || []), user.id] })
      .eq('id', friendId);

    if (updateFriendError) {
      console.error('Error updating friend list:', updateFriendError);
      throw updateFriendError;
    }

    console.log('Friend added successfully');
  };

  return {
    friends,
    loading,
    searchUsers,
    addFriend,
  };
}