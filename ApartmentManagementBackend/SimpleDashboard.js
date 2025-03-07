import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

const StatisticCard = ({ title, value, backgroundColor }) => (
  <View style={[styles.card, { backgroundColor }]}>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

const ActivityItem = ({ description, date }) => (
  <View style={styles.activityItem}>
    <View style={styles.activityDot} />
    <View style={styles.activityContent}>
      <Text style={styles.activityText}>{description}</Text>
      <Text style={styles.activityDate}>{date}</Text>
    </View>
  </View>
);

const BuildingItem = ({ name, address }) => (
  <TouchableOpacity style={styles.buildingItem}>
    <View style={styles.buildingIcon}>
      <Text style={styles.buildingIconText}>🏢</Text>
    </View>
    <View style={styles.buildingContent}>
      <Text style={styles.buildingName}>{name}</Text>
      <Text style={styles.buildingAddress}>{address}</Text>
    </View>
  </TouchableOpacity>
);

const SimpleDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    statistics: {
      totalResidents: 150,
      activeComplaints: 5,
      pendingPayments: 10,
      upcomingMeetings: 3
    },
    activities: [
      { id: 1, description: 'Yeni bir şikayet oluşturuldu', date: '10:30' },
      { id: 2, description: 'Ödeme alındı', date: '09:15' },
      { id: 3, description: 'Toplantı planlandı', date: '08:45' },
    ],
    buildings: [
      { id: 1, name: 'Yeşil Vadi Sitesi', address: 'Çankaya, Ankara' },
      { id: 2, name: 'Mavi Göl Apartmanı', address: 'Ataşehir, İstanbul' },
      { id: 3, name: 'Park Residence', address: 'Karşıyaka, İzmir' },
    ],
    financialSummary: {
      income: '₺45,000',
      expense: '₺32,000',
      balance: '₺13,000'
    }
  });

  useEffect(() => {
    // Simüle edilmiş veri yükleme
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simüle edilmiş yenileme
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yönetici Paneli</Text>
        <Text style={styles.headerSubtitle}>Hoş geldiniz, Admin</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <StatisticCard
          title="Toplam Sakin"
          value={dashboardData.statistics.totalResidents}
          backgroundColor="#4CAF50"
        />
        <StatisticCard
          title="Aktif Şikayetler"
          value={dashboardData.statistics.activeComplaints}
          backgroundColor="#F44336"
        />
        <StatisticCard
          title="Bekleyen Ödemeler"
          value={dashboardData.statistics.pendingPayments}
          backgroundColor="#FF9800"
        />
        <StatisticCard
          title="Yaklaşan Toplantılar"
          value={dashboardData.statistics.upcomingMeetings}
          backgroundColor="#2196F3"
        />
      </View>

      {/* Financial Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Finansal Özet</Text>
        <View style={styles.financialContainer}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Gelir</Text>
            <Text style={[styles.financialValue, { color: '#4CAF50' }]}>
              {dashboardData.financialSummary.income}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Gider</Text>
            <Text style={[styles.financialValue, { color: '#F44336' }]}>
              {dashboardData.financialSummary.expense}
            </Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Bakiye</Text>
            <Text style={[styles.financialValue, { color: '#2196F3' }]}>
              {dashboardData.financialSummary.balance}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
        {dashboardData.activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            description={activity.description}
            date={activity.date}
          />
        ))}
      </View>

      {/* Managed Buildings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yönetilen Binalar</Text>
        {dashboardData.buildings.map((building) => (
          <BuildingItem
            key={building.id}
            name={building.name}
            address={building.address}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 30) / 2,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardTitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  financialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  financialItem: {
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  buildingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  buildingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  buildingIconText: {
    fontSize: 20,
  },
  buildingContent: {
    flex: 1,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  buildingAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
});

export default SimpleDashboard; 