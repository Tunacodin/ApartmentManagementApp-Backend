import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { Card, Title, Text, useTheme } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import AnimatedCard from '../../../components/AnimatedCard';
import colors from '../../../styles/colors';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import axios from 'axios';

const AdminReport = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const adminId = 1; // Örnek adminId, gerçek uygulamada auth'dan alınmalı
        fetchReportData(adminId);
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simüle edilmiş yenileme gecikmesi
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const fetchReportData = async (adminId) => {
        try {
            const [financialRes, activitiesRes, statisticsRes, meetingsRes] = await Promise.all([
                axios.get(API_ENDPOINTS.ADMIN.FINANCIAL_SUMMARIES(adminId)),
                axios.get(API_ENDPOINTS.ADMIN.ACTIVITIES(adminId)),
                axios.get(API_ENDPOINTS.ADMIN.STATISTICS(adminId)),
                axios.get(API_ENDPOINTS.ADMIN.MEETINGS)
            ]);

            setReportData({
                monthlyIncome: financialRes.data,
                paymentStats: statisticsRes.data.paymentStats,
                complaintAnalytics: statisticsRes.data.complaintAnalytics,
                meetings: meetingsRes.data
            });
        } catch (error) {
            console.error('Error fetching report data:', error.response?.data || error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    if (loading || !reportData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchReportData(1)} />
            }
        >
            {/* Gelir Raporu */}
            <AnimatedCard style={styles.cardContainer}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Aylık Gelir Raporu</Title>
                        <LineChart
                            data={{
                                labels: ["Oca", "Şub", "Mar", "Nis", "May", "Haz"],
                                datasets: [{
                                    data: reportData.monthlyIncome.data || [0, 0, 0, 0, 0, 0]
                                }]
                            }}
                            width={Dimensions.get("window").width - 40}
                            height={220}
                            chartConfig={{
                                backgroundColor: colors.palette.background.paper,
                                backgroundGradientFrom: colors.palette.background.paper,
                                backgroundGradientTo: colors.palette.background.paper,
                                decimalPlaces: 0,
                                color: (opacity = 1) => colors.palette.chart.blue,
                                labelColor: () => colors.palette.text.primary,
                                style: { borderRadius: 16 }
                            }}
                            bezier
                            style={styles.chart}
                        />
                    </Card.Content>
                </Card>
            </AnimatedCard>

            {/* Ödeme İstatistikleri */}
            <AnimatedCard style={styles.cardContainer}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Ödeme İstatistikleri</Title>
                        <PieChart
                            data={[
                                {
                                    name: 'Zamanında',
                                    population: reportData.paymentStats.onTime || 0,
                                    color: colors.palette.success.main,
                                    legendFontColor: colors.palette.text.primary
                                },
                                {
                                    name: 'Geç',
                                    population: reportData.paymentStats.late || 0,
                                    color: colors.palette.warning.main,
                                    legendFontColor: colors.palette.text.primary
                                },
                                {
                                    name: 'Ödenmemiş',
                                    population: reportData.paymentStats.unpaid || 0,
                                    color: colors.palette.error.main,
                                    legendFontColor: colors.palette.text.primary
                                }
                            ]}
                            width={Dimensions.get("window").width - 40}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) => colors.palette.text.primary
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                        />
                    </Card.Content>
                </Card>
            </AnimatedCard>

            {/* Şikayet Analizi */}
            <AnimatedCard style={styles.cardContainer}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.cardTitle}>Şikayet Analizi</Title>
                        <BarChart
                            data={{
                                labels: ["Teknik", "Temizlik", "Güvenlik", "Gürültü", "Diğer"],
                                datasets: [{
                                    data: reportData.complaintAnalytics.data || [0, 0, 0, 0, 0]
                                }]
                            }}
                            width={Dimensions.get("window").width - 40}
                            height={220}
                            chartConfig={{
                                backgroundColor: colors.palette.background.paper,
                                backgroundGradientFrom: colors.palette.background.paper,
                                backgroundGradientTo: colors.palette.background.paper,
                                decimalPlaces: 0,
                                color: (opacity = 1) => colors.palette.chart.purple,
                                labelColor: () => colors.palette.text.primary,
                            }}
                            style={styles.chart}
                        />
                    </Card.Content>
                </Card>
            </AnimatedCard>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.palette.background.default,
        padding: 16,
    },
    cardContainer: {
        marginBottom: 16,
    },
    card: {
        backgroundColor: colors.palette.background.paper,
        elevation: 4,
        borderRadius: 12,
    },
    cardTitle: {
        color: colors.palette.text.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.palette.background.default,
    },
});

export default AdminReport;
