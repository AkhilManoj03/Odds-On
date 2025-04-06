import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBalance } from '@/hooks/useBalance';
import { useBets, useLiveBets } from '@/hooks/useBets';
import { useRouter } from 'expo-router';
import TabToggle from './TabToggle';
import GameCardGrid from './GameCardGrid';
import BottomNavBar from './BottomNavBar';
import Header from './Header';
import BetCardContainer from './BetCardContainer';
import { useAvailableLines } from '@/hooks/useAvailableLines';
import { Line } from 'react-native-svg';

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const { balance, loading: balanceLoading } = useBalance();
  const { bets, loading: betsLoading } = useBets();
  const { lines, loading: gameDataLoading } = useAvailableLines(); // Ensure game data is loaded for the player images
  const { liveBets, loading: liveBetsLoading } = useLiveBets();
  const [activeTab, setActiveTab] = useState<'open'| 'friends'>('open');
  const router = useRouter();

  // Extract user ID from session
  const userId = session?.user?.id;

  // Transform bets data for PlayerCardGrid
  const gameCards = lines.map(line => {

    const name = `${line.away_team} x ${line.home_team}`

    return {
      id: line.id,
      name: name,
      points: line.point,
      odds: line.price,
      outcome: line.outcome_name
    };
  });

  // Transform live bets data for BetCardContainer
  const betCardData = liveBets.map(bet => ({
    sender: bet.poster_email.split('@')[0].charAt(0).toUpperCase() + bet.poster_email.split('@')[0].slice(1), // Capitalize the first letter of the email username part
    playerName: bet.name,
    statLine: `${bet.points} pts (${bet.odds})`, // Include odds in the stat line
    value: `$${bet.p_money.toFixed(2)}`, // Format money with 2 decimal places
    side: bet.side // Use the side from the live bet
  }));

  const handleNavigation = (index: number) => {
    switch (index) {
      case 0: // Home
        // Already on home page
        console.log('debug: Already on home page');
        break;
      case 1:
        console.log('debug: Navigating to My Bets');
        router.push('/my-bets');
        break;
      case 2: // 
        console.log('debug: Navigating to Friends');
        router.push('/friends');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {session && session.user.email && (
          <Header onLogout={signOut} />
        )}

        <View style={styles.authButtons}>
          {!session ? (
            <TouchableOpacity 
              style={styles.authButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.authButtonText}>Login</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.tabContainer}>
          <TabToggle activeTab={activeTab} onTabChange={setActiveTab}/>
        </View>

        <View style={styles.featuredSection}>
          {activeTab === 'open' ? (
            <>
              <Text style={styles.sectionTitle}>Available Bets</Text>
              {betsLoading ? (
                <Text style={styles.loadingText}>Loading bets...</Text>
              ) : bets.length === 0 ? (
                <Text style={styles.loadingText}>No bets available at the moment</Text>
              ) : (
                <GameCardGrid games={gameCards} />
              )}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Live Bets</Text>
              {liveBetsLoading ? (
                <Text style={styles.loadingText}>Loading live bets...</Text>
              ) : betCardData.length === 0 ? (
                <Text style={styles.loadingText}>No live bets at the moment</Text>
              ) : (
                <View style={styles.betCardContainer}>
                  <BetCardContainer
                    userId={userId}
                  />
                </View>
              )}
            </>
          )}
        </View>
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
  authButtons: {
    padding: 16,
    alignItems: 'center',
  },
  authButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  tabContainer: {
    alignItems: 'center',
  },
  featuredSection: {
    padding: 20,
    paddingBottom: 100, // Add padding to account for bottom nav bar
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 15,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  betCardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100
  },
});