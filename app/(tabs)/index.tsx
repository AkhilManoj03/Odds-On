import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBalance } from '@/hooks/useBalance';
import { useBets, useLiveBets, useBettingCoefficients } from '@/hooks/useBets';
import { useRouter } from 'expo-router';
import TabToggle from './TabToggle';
import GameCardGrid from './GameCardGrid';
import BottomNavBar from './BottomNavBar';
import Header from './Header';
import BetCardContainer from './BetCardContainer';
import { useAvailableLines } from '@/hooks/useAvailableLines';

export default function HomeScreen() {
  const { session, signOut } = useAuth();
  const { balance, loading: balanceLoading } = useBalance();
  const { coefficients, loading: coefficientsLoading } = useBettingCoefficients();
  const { lines, loading: gameDataLoading } = useAvailableLines();
  const { liveBets, loading: liveBetsLoading } = useLiveBets();
  const [activeTab, setActiveTab] = useState<'open'| 'friends'>('open');
  const router = useRouter();

  // Extract user ID from session
  const userId = session?.user?.id;

  // Transform coefficients data for GameCardGrid
  const gameCards = coefficients.map(coeff => ({
    id: coeff.game_id,
    name: `${coeff.away_team} @ ${coeff.home_team}`, // You might want to get actual game names from another source
    points: Number((coeff.line).toFixed(0)),
    odds: -100, // Default odds at x_at_neg_100
    coefficients: [coeff.cubic_coeff_0, coeff.cubic_coeff_1, coeff.cubic_coeff_2, coeff.cubic_coeff_3],
    min_line: coeff.min_line,
    max_line: coeff.max_line,
  }));

  // Transform live bets data for BetCardContainer
  const betCardData = liveBets.map(bet => ({
    sender: bet.poster_email.split('@')[0].charAt(0).toUpperCase() + bet.poster_email.split('@')[0].slice(1),
    playerName: bet.name,
    statLine: `${bet.points} pts (${bet.odds})`,
    value: `$${bet.p_money.toFixed(2)}`,
    side: bet.side
  }));

  const handleNavigation = (index: number) => {
    switch (index) {
      case 0:
        console.log('debug: Already on home page');
        break;
      case 1:
        console.log('debug: Navigating to My Bets');
        router.push('/my-bets');
        break;
      case 2:
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
              {coefficientsLoading ? (
                <Text style={styles.loadingText}>Loading bets...</Text>
              ) : gameCards.length === 0 ? (
                <Text style={styles.loadingText}>No bets available at the moment</Text>
              ) : (
                console.log('debug: gameCards', gameCards),
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