import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ActivitiesScreen = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      const adminId = getCurrentAdminId();
      const response = await axios.get(API_ENDPOINTS.ADMIN.ACTIVITIES(adminId));

      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error('Aktivite verisi çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'payment':
        return 'cash';
      case 'complaint':
        return 'alert-circle';
      case 'meeting':
        return 'calendar-clock';
      case 'announcement':
        return 'bullhorn';
      default:
        return 'information';
    }
  };

  const getActivityTypeText = (type) => {
    switch (type.toLowerCase()) {
      case 'payment':
        return 'Ödeme';
      case 'complaint':
        return 'Şikayet';
      case 'meeting':
        return 'Toplantı';
      case 'announcement':
        return 'Duyuru';
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'tamamlandı':
        return '#34C759';
      case 'pending':
      case 'bekliyor':
        return '#FF9500';
      case 'cancelled':
      case 'iptal':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <View style={styles.activityTypeContainer}>
          <MaterialCommunityIcons
            name={getActivityIcon(item.activityType)}
            size={24}
            color="#007AFF"
          />
          <Text style={styles.activityType}>
            {getActivityTypeText(item.activityType)}
          </Text>
        </View>
        <Text style={[styles.activityStatus, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.activityDescription}>{item.description}</Text>
      <View style={styles.activityFooter}>
        <Text style={styles.activityDate}>
          {new Date(item.date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <Text style={styles.buildingName}>{item.buildingName}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="information" size={48} color="#8E8E93" />
            <Text style={styles.emptyText}>Henüz aktivite bulunmuyor</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  activityItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityType: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  activityStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityDescription: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  activityDate: {
    fontSize: 13,
    color: '#666',
  },
  buildingName: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default ActivitiesScreen; 