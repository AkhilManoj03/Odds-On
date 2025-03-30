import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import TabToggle from './TabToggle';
import BottomNavBar from './BottomNavBar';
import Header from './Header';
import MyBetsToggle from './MyBetsToggle';
import { useLiveBets } from '@/hooks/useBets';
import { useAuth } from "@/hooks/useAuth";

const MyBetsScreen = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const router = useRouter();
  const { session } = useAuth();
  const { liveBets, loading: liveBetsLoading } = useLiveBets();
  const userId = session?.user?.id;

  // Filter for active bets
  const filteredLiveBets = liveBets.filter(bet => bet.poster === userId && bet.acceptor !== null);

  // Filter for completed bets
  const filteredCompletedBets = liveBets.filter(bet => bet.poster === userId && bet.winner !== null);

  // Utility function to format email
  const formatEmail = (email: string) => {
    const name = email.split('@')[0]; // Get the part before the '@'
    return name.charAt(0).toUpperCase() + name.slice(1); // Capitalize the first letter
  };

  const handleNavigation = (index: number) => {
    switch (index) {
      case 0: // Home
        console.log('debug: Already on home page');
        router.push('/');
        break;
      case 1:
        console.log('debug: Navigating to My Bets');
        break;
      case 2: // 
        console.log('debug: Navigating to Friends');
        router.push('/friends');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <MyBetsToggle activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView style={styles.scrollView}>
        {liveBetsLoading ? (
          <Text style={styles.loadingText}>Loading live bets...</Text>
        ) : activeTab === 'active' ? (
          filteredLiveBets.length === 0 ? (
            <Text style={styles.loadingText}>No active bets available.</Text>
          ) : (
            filteredLiveBets.map(bet => (
              <View key={bet.id} style={styles.section}>
                <Text style={styles.title}>{bet.name}</Text>
                <Text style={styles.statLine}>{`${bet.points} pts (${bet.odds})`}</Text>
                <Text style={styles.value}>Value: ${bet.p_money.toFixed(2)}</Text>
                <Text style={styles.value}>Friend: {formatEmail(bet.acceptor_email)}</Text>
              </View>
            ))
          )
        ) : (
          filteredCompletedBets.length === 0 ? (
            <Text style={styles.loadingText}>No completed bets available.</Text>
          ) : (
            filteredCompletedBets.map(bet => (
              <View key={bet.id} style={styles.section}>
                <Text style={styles.title}>{bet.name}</Text>
                <Text style={styles.statLine}>{`${bet.points} pts (${bet.odds})`}</Text>
                <Text style={styles.value}>Value: ${bet.p_money.toFixed(2)}</Text>
                <Text style={styles.value}>Winner: {formatEmail(bet.winner_email)}</Text>
              </View>
            ))
          )
        )}
      </ScrollView>
      <BottomNavBar onNavigate={handleNavigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  statLine: {
    fontSize: 16,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
  },
});

export default MyBetsScreen;
