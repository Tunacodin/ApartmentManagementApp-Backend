import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ADMIN_ENDPOINTS, getHeaders } from '../config/apiConfig';
import { colors } from '../config/colorPalette';
import AnimatedCard from '../components/AnimatedCard';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const AdminReports = () => {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reportData, setReportData] = useState({
        monthlyIncome: [],
        paymentStats: {},
        complaintAnalytics: {},
        occupancyRates: {},
        meetingStats: {}
    });

    const fetchReportData = async () => {
        try {
            const headers = getHeaders(token);
            const [
                incomeRes,
                paymentRes,
                complaintRes,
                occupancyRes,
                meetingRes
            ] = await Promise.all([
                fetch(ADMIN_ENDPOINTS.GET_MONTHLY_INCOME(user.id), { headers }),
                fetch(ADMIN_ENDPOINTS.GET_PAYMENT_STATISTICS(user.id), { headers }),
                fetch(ADMIN_ENDPOINTS.GET_COMPLAINT_ANALYTICS(user.id), { headers }),
                fetch(ADMIN_ENDPOINTS.GET_OCCUPANCY_RATES(user.id), { headers }),
                fetch(ADMIN_ENDPOINTS.GET_MEETING_STATISTICS(user.id), { headers })
            ]);

            const [
                monthlyIncome,
                paymentStats,
                complaintAnalytics,
                occupancyRates,
                meetingStats
            ] = await Promise.all([
                incomeRes.json(),
                paymentRes.json(),
                complaintRes.json(),
                occupancyRes.json(),
                meetingRes.json()
            ]);

            setReportData({
                monthlyIncome,
                paymentStats,
                complaintAnalytics,
                occupancyRates,
                meetingStats
            });
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchReportData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary.main} />
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
            {/* Gelir Grafiği */}
            <AnimatedCard style={styles.card}>
                <Text style={styles.cardTitle}>Aylık Gelir Analizi</Text>
                <LineChart
                    data={{
                        labels: reportData.monthlyIncome.map(item => item.month),
                        datasets: [{
                            data: reportData.monthlyIncome.map(item => item.amount)
                        }]
                    }}
                    width={width - 40}
                    height={220}
                    chartConfig={{
                        backgroundColor: colors.background.paper,
                        backgroundGradientFrom: colors.background.paper,
                        backgroundGradientTo: colors.background.paper,
                        decimalPlaces: 0,
                        color: (opacity = 1) => colors.chart.blue,
                        style: {
                            borderRadius: 16
                        }
                    }}
                    style={styles.chart}
                />
            </AnimatedCard>

            {/* Ödeme İstatistikleri */}
            <AnimatedCard style={styles.card}>
                <Text style={styles.cardTitle}>Ödeme Durumu</Text>
                <PieChart
                    data={[
                        {
                            name: 'Ödenen',
                            population: reportData.paymentStats.paid,
                            color: colors.chart.green,
                            legendFontColor: colors.text.primary
                        },
                        {
                            name: 'Bekleyen',
                            population: reportData.paymentStats.pending,
                            color: colors.chart.yellow,
                            legendFontColor: colors.text.primary
                        },
                        {
                            name: 'Geciken',
                            population: reportData.paymentStats.overdue,
                            color: colors.chart.red,
                            legendFontColor: colors.text.primary
                        }
                    ]}
                    width={width - 40}
                    height={220}
                    chartConfig={{
                        color: (opacity = 1) => colors.text.primary
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    style={styles.chart}
                />
            </AnimatedCard>

            {/* Şikayet Analizi */}
            <AnimatedCard style={styles.card}>
                <Text style={styles.cardTitle}>Şikayet Analizi</Text>
                <BarChart
                    data={{
                        labels: ['Açık', 'İşlemde', 'Çözüldü'],
                        datasets: [{
                            data: [
                                reportData.complaintAnalytics.open,
                                reportData.complaintAnalytics.inProgress,
                                reportData.complaintAnalytics.resolved
                            ]
                        }]
                    }}
                    width={width - 40}
                    height={220}
                    chartConfig={{
                        backgroundColor: colors.background.paper,
                        backgroundGradientFrom: colors.background.paper,
                        backgroundGradientTo: colors.background.paper,
                        decimalPlaces: 0,
                        color: (opacity = 1) => colors.chart.purple,
                        style: {
                            borderRadius: 16
                        }
                    }}
                    style={styles.chart}
                />
            </AnimatedCard>

            {/* İstatistik Kartları */}
            <View style={styles.statsContainer}>
                <AnimatedCard style={styles.statCard}>
                    <MaterialCommunityIcons 
                        name="home-city" 
                        size={24} 
                        color={colors.primary.main} 
                    />
                    <Text style={styles.statTitle}>Doluluk Oranı</Text>
                    <Text style={styles.statValue}>
                        {reportData.occupancyRates.percentage}%
                    </Text>
                </AnimatedCard>

                <AnimatedCard style={styles.statCard}>
                    <MaterialCommunityIcons 
                        name="calendar-check" 
                        size={24} 
                        color={colors.primary.main} 
                    />
                    <Text style={styles.statTitle}>Toplantı Katılımı</Text>
                    <Text style={styles.statValue}>
                        {reportData.meetingStats.attendanceRate}%
                    </Text>
                </AnimatedCard>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.default,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.default,
    },
    card: {
        margin: 10,
        padding: 15,
        borderRadius: 12,
        backgroundColor: colors.background.paper,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 15,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    statCard: {
        flex: 1,
        margin: 5,
        padding: 15,
        borderRadius: 12,
        backgroundColor: colors.background.paper,
        alignItems: 'center',
        elevation: 4,
    },
    statTitle: {
        fontSize: 14,
        color: colors.text.secondary,
        marginTop: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary.main,
        marginTop: 4,
    },
});

export default AdminReports; 