import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import axios from 'axios';
import { API_ENDPOINTS, getCurrentAdminId } from '../../../config/apiConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ActivitiesScreen = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const refreshTimeout = useRef(null);

  const fetchActivities = async (pageNumber = 1, shouldRefresh = false) => {
    try {
      // Önceki timeout'u temizle
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }

      const adminId = getCurrentAdminId();
      const response = await axios.get(`${API_ENDPOINTS.ADMIN.ACTIVITIES(adminId)}?page=${pageNumber}&limit=10`);
      
      const newActivities = response.data.data || [];
      const hasNewData = newActivities.length > 0;
      
      if (shouldRefresh) {
        if (!hasNewData) {
          // Yeni veri yoksa 1 saniye sonra yenilemeyi sonlandır
          refreshTimeout.current = setTimeout(() => {
            setRefreshing(false);
          }, 1000);
        }
        setActivities(newActivities);
      } else {
        setActivities(prev => {
          const uniqueActivities = [...prev];
          let hasAddedNew = false;
          
          newActivities.forEach(newActivity => {
            if (!uniqueActivities.some(existing => existing.id === newActivity.id)) {
              uniqueActivities.push(newActivity);
              hasAddedNew = true;
            }
          });

          if (!hasAddedNew) {
            // Yeni veri eklenemediyse 1 saniye sonra yenilemeyi sonlandır
            refreshTimeout.current = setTimeout(() => {
              setRefreshing(false);
            }, 1000);
          }
          
          return uniqueActivities;
        });
      }
      
      setHasMore(newActivities.length === 10);
      setPage(pageNumber);
    } catch (error) {
      console.error('Aktiviteler yüklenirken hata:', error);
      // Hata durumunda da yenilemeyi sonlandır
      setRefreshing(false);
    } finally {
      setLoading(false);
    }
  };

  // Component unmount olduğunda timeout'u temizle
  useEffect(() => {
    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchActivities(page + 1);
    }
  };

  const ActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityType}>{item.activityType}</Text>
        <Text style={[
          styles.activityStatus,
          { color: item.status === 'Paid' ? '#34C759' : '#FF9500' }
        ]}>
          {item.status === 'Paid' ? 'Ödendi' : 'Bekliyor'}
        </Text>
      </View>
      <Text style={styles.activityDescription}>{item.description}</Text>
      <View style={styles.activityFooter}>
        <Text style={styles.activityUser}>{item.relatedUserName}</Text>
        <Text style={styles.activityDate}>
          {new Date(item.activityDate).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Aktivite Geçmişi</Text>
      </View>
      
      <FlatList
        data={activities}
        renderItem={({ item }) => <ActivityItem item={item} />}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            title="Yenileniyor..."
            tintColor="#007AFF"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz aktivite kaydı bulunmuyor</Text>
        }
        ListFooterComponent={
          hasMore && activities.length > 0 ? (
            <ActivityIndicator style={styles.footer} color="#007AFF" />
          ) : null
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  activityItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
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
    marginBottom: 8,
  },
  activityType: {
    fontWeight: 'bold',
    color: '#007AFF',
    fontSize: 14,
  },
  activityStatus: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  activityDescription: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  activityUser: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    paddingVertical: 20,
  },
});

export default ActivitiesScreen; 