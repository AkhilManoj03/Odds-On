import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Search, UserPlus, UserCheck } from 'lucide-react-native';
import { useFriends } from '@/hooks/useFriends';
import { useRouter } from 'expo-router';
import BottomNavBar from './BottomNavBar';
import Header from './Header';

interface User {
  id: string;
  email: string;
  friends: string[];
}

export default function FriendsScreen() {
  const { friends, searchUsers, addFriend } = useFriends();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load all users when component mounts
  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      console.log('Loading all users...');
      setLoading(true);
      setError(null);
      const results = await searchUsers('');
      console.log('All users loaded:', results);
      setSearchResults(results);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      console.log('Empty search query, showing all users');
      loadAllUsers();
      return;
    }
    
    try {
      console.log('Starting search with query:', searchQuery);
      setLoading(true);
      setError(null);
      const results = await searchUsers(searchQuery);
      console.log('Search completed, setting results:', results);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: string) => {
    try {
      console.log('Attempting to add friend:', friendId);
      await addFriend(friendId);
      console.log('Friend added, updating UI');
      setSearchResults(prev => prev.filter(user => user.id !== friendId));
    } catch (err) {
      console.error('Failed to add friend:', err);
      setError(err instanceof Error ? err.message : 'Failed to add friend');
    }
  };

  const getUsername = (email: string) => {
    return email.split('@')[0];
  };

  const handleNavigation = (index: number) => {
    switch (index) {
      case 0: // Home
        router.push('/');
        break;
      case 1: // Second option (leave empty for now)'
        router.push('/my-bets');
        break;
      case 2: // Friends
        // Already on friends page
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by email"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Search size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {loading ? (
          <ActivityIndicator style={styles.loader} color="#007AFF" />
        ) : (
          <>
            {searchResults.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search Results</Text>
                <FlatList
                  data={searchResults}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.userCard}>
                      <View style={styles.userInfo}>
                        <Text style={styles.username}>{getUsername(item.email)}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddFriend(item.id)}
                      >
                        <UserPlus size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  ListEmptyComponent={
                    searchQuery ? (
                      <Text style={styles.emptyText}>No users found</Text>
                    ) : null
                  }
                />
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Friends</Text>
              <FlatList
                data={friends}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.userCard}>
                    <View>
                      <Text style={styles.username}>{getUsername(item.email)}</Text>
                      <Text style={styles.email}>{item.email}</Text>
                    </View>
                    <UserCheck size={20} color="#28a745" />
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No friends yet. Start by searching for users!</Text>
                }
              />
            </View>
          </>
        )}
      </ScrollView>
      <BottomNavBar onNavigate={handleNavigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 10,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 15,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});