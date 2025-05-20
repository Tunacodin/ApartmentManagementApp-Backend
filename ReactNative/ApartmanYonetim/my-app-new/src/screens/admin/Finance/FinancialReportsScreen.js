import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import axios from 'axios';

const FinancialReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly'); // monthly, yearly

  const fetchFinancialData = async () => {
    try {
      const adminId = 1; // Bu değer auth sisteminden alınmalı
      const response = await axios.get(`api/Admin/${adminId}/financial-summaries`);
      setFinancialData(response.data.data);
    } catch (error) {
      console.error('Finansal rapor çekilemedi:', error);
      Alert.alert('Hata', 'Finansal rapor yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [selectedPeriod]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFinancialData();
  };

  const ReportCard = ({ title, value, type = 'currency' }) => (
    <View style={styles.reportCard}>
      <Text style={styles.reportTitle}>{title}</Text>
      <Text style={[
        styles.reportValue,
        { color: type === 'percentage' ? '#007AFF' : value >= 0 ? '#28a745' : '#dc3545' }
      ]}>
        {type === 'currency' ? `${value}₺` : `${value}%`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Finansal Raporlar</Text>
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity 
          style={[
            styles.periodButton,
            selectedPeriod === 'monthly' && styles.selectedPeriod
          ]}
          onPress={() => setSelectedPeriod('monthly')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'monthly' && styles.selectedPeriodText
          ]}>Aylık</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.periodButton,
            selectedPeriod === 'yearly' && styles.selectedPeriod
          ]}
          onPress={() => setSelectedPeriod('yearly')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'yearly' && styles.selectedPeriodText
          ]}>Yıllık</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genel Bakış</Text>
        <View style={styles.reportGrid}>
          <ReportCard title="Toplam Gelir" value={financialData?.totalIncome || 0} />
          <ReportCard title="Toplam Gider" value={financialData?.totalExpense || 0} />
          <ReportCard title="Net Bakiye" value={financialData?.balance || 0} />
          <ReportCard title="Bekleyen Ödemeler" value={financialData?.pendingPayments || 0} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aidat Durumu</Text>
        <View style={styles.reportGrid}>
          <ReportCard title="Toplam Aidat" value={financialData?.totalDues || 0} />
          <ReportCard title="Ödenen Aidat" value={financialData?.paidDues || 0} />
          <ReportCard title="Ödeme Oranı" value={financialData?.duesPaymentRate || 0} type="percentage" />
          <ReportCard title="Gecikmiş Ödemeler" value={financialData?.lateDues || 0} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gider Analizi</Text>
        <View style={styles.reportGrid}>
          <ReportCard title="Ortak Alan Giderleri" value={financialData?.commonAreaExpenses || 0} />
          <ReportCard title="Bakım Onarım" value={financialData?.maintenanceExpenses || 0} />
          <ReportCard title="Personel Giderleri" value={financialData?.staffExpenses || 0} />
          <ReportCard title="Diğer Giderler" value={financialData?.otherExpenses || 0} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  centerContainer: {
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
  periodSelector: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  periodButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: '#f8f9fa',
  },
  selectedPeriod: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedPeriodText: {
    color: '#fff',
    fontWeight: '500',
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
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reportCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  reportValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FinancialReportsScreen;
