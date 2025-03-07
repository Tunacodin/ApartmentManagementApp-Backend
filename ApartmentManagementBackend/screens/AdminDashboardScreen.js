import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { fetchDashboardData } from '../services/dashboardService';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const StatCard = ({ title, value, icon, color }) => (
  <Card style={styles.statCard}>
    <Card.Content style={styles.statCardContent}>
      <MaterialCommunityIcons name={icon} size={30} color={color} />
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </Card.Content>
  </Card>
);

const AdminDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const theme = useTheme();

  const loadDashboardData = async () => {
    try {
      // TODO: Get adminId from authentication context
      const adminId = 1; // Temporary
      const data = await fetchDashboardData(adminId);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Toplam Sakin"
          value={dashboardData?.statistics?.TotalResidents || 0}
          icon="account-group"
          color={theme.colors.primary}
        />
        <StatCard
          title="Aktif Şikayetler"
          value={dashboardData?.statistics?.ActiveComplaints || 0}
          icon="alert-circle"
          color={theme.colors.error}
        />
        <StatCard
          title="Bekleyen Ödemeler"
          value={dashboardData?.statistics?.PendingPayments || 0}
          icon="cash-multiple"
          color={theme.colors.warning}
        />
        <StatCard
          title="Yaklaşan Toplantılar"
          value={dashboardData?.statistics?.UpcomingMeetings || 0}
          icon="calendar-clock"
          color={theme.colors.success}
        />
      </View>

      {/* Financial Summary Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>Finansal Özet</Title>
          <LineChart
            data={{
              labels: dashboardData?.financials?.map(f => f.month) || [],
              datasets: [{
                data: dashboardData?.financials?.map(f => f.amount) || []
              }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => theme.colors.primary,
              style: {
                borderRadius: 16
              }
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Recent Activities */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Son Aktiviteler</Title>
          {dashboardData?.activities?.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <MaterialCommunityIcons
                name={activity.icon || 'clock-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.description}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Managed Buildings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Yönetilen Binalar</Title>
          {dashboardData?.buildings?.map((building, index) => (
            <View key={index} style={styles.buildingItem}>
              <MaterialCommunityIcons
                name="building"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.buildingContent}>
                <Text style={styles.buildingName}>{building.name}</Text>
                <Text style={styles.buildingAddress}>{building.address}</Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    width: '48%',
    marginBottom: 10,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  statTextContainer: {
    marginLeft: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  card: {
    marginBottom: 15,
  },
  chartCard: {
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityContent: {
    marginLeft: 10,
    flex: 1,
  },
  activityText: {
    fontSize: 14,
  },
  activityDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  buildingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buildingContent: {
    marginLeft: 10,
    flex: 1,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buildingAddress: {
    fontSize: 12,
    opacity: 0.6,
  },
});

export default AdminDashboardScreen;