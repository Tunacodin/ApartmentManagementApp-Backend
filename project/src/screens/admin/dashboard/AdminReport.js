import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions,
    RefreshControl,
    ActivityIndicator,
    Platform
} from 'react-native';
import { Card, Title, Text, useTheme } from 'react-native-paper';
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph
} from 'react-native-chart-kit';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';
import AnimatedCard from '../../../components/AnimatedCard';
import colors from '../../../styles/colors';
import { API_ENDPOINTS, handleApiError } from '../../../config/apiConfig';
import axios from 'axios';

const screenWidth = Dimensions.get("window").width;

// chartColors'ı component dışına taşıyoruz
const chartColors = {
    primary: '#7B68EE', // Ana mor
    secondary: '#9370DB', // Orta mor
    accent: '#E6E6FA', // Açık mor
    background: '#F8F7FF', // Çok açık mor-beyaz
    text: '#2D3748',
    gradient: [
        '#7B68EE',
        '#9370DB',
        '#E6E6FA'
    ]
};

const AdminReport = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);

    // Yeni mock veriler
    const mockReportData = {
        monthlyIncome: {
            data: [45000, 52000, 49000, 60000, 55000, 58000]
        },
        paymentStats: [
            { value: 75, text: 'Zamanında', color: chartColors.primary },
            { value: 15, text: 'Geç', color: chartColors.secondary },
            { value: 10, text: 'Ödenmemiş', color: chartColors.accent }
        ],
        complaintAnalytics: {
            data: [
                { month: 'Ocak', complaints: 12 },
                { month: 'Şubat', complaints: 8 },
                { month: 'Mart', complaints: 15 },
                { month: 'Nisan', complaints: 7 },
                { month: 'Mayıs', complaints: 10 }
            ]
        },
        expenseCategories: [
            { category: 'Bakım', amount: 12000 },
            { category: 'Güvenlik', amount: 8000 },
            { category: 'Temizlik', amount: 15000 },
            { category: 'Elektrik', amount: 7000 },
            { category: 'Su', amount: 5000 }
        ],
        progressData: {
            labels: ["Swim", "Bike", "Run"],
            data: [0.4, 0.6, 0.8]
        },
        contributionData: [
            { date: "2024-01-02", count: 1 },
            { date: "2024-01-03", count: 2 },
            { date: "2024-01-04", count: 3 },
            { date: "2024-01-05", count: 4 },
            { date: "2024-01-06", count: 1 },
            { date: "2024-01-30", count: 2 },
            { date: "2024-01-31", count: 3 },
            { date: "2024-02-01", count: 2 },
            { date: "2024-02-02", count: 4 },
        ],
        bezierLineData: {
            labels: ["January", "February", "March", "April", "May", "June"],
            datasets: [
                {
                    data: [
                        Math.random() * 100,
                        Math.random() * 100,
                        Math.random() * 100,
                        Math.random() * 100,
                        Math.random() * 100,
                        Math.random() * 100
                    ]
                }
            ]
        }
    };

    const chartConfig = {
        backgroundColor: chartColors.background,
        backgroundGradientFrom: chartColors.gradient[0],
        backgroundGradientTo: chartColors.gradient[2],
        color: (opacity = 1) => `rgba(123, 104, 238, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(45, 55, 72, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        useShadowColorFromDataset: false,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: chartColors.primary
        }
    };

    const darkChartConfig = {
        backgroundColor: "#1a1a1a",
        backgroundGradientFrom: "#1a1a1a",
        backgroundGradientTo: "#1a1a1a",
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        decimalPlaces: 0,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
        }
    };

    const loadData = () => {
        setError(null);
        setLoading(true);
        const data = {
            ...mockReportData,
            bezierLineData: mockReportData.bezierLineData,
            progressData: mockReportData.progressData,
            contributionData: mockReportData.contributionData
        };
        setTimeout(() => {
            setReportData(data);
            setLoading(false);
        }, 1000);
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setReportData(mockReportData);
            setRefreshing(false);
        }, 1000);
    }, []);

    if (loading || !reportData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={chartColors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.retryText} onPress={loadData}>
                    Yeniden Dene
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Gelir Raporu - Line Chart */}
            <LineChart
                data={{
                    labels: ["Oca", "Şub", "Mar", "Nis", "May", "Haz"],
                    datasets: [{
                        data: reportData.monthlyIncome.data
                    }]
                }}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
            />

            {/* Ödeme İstatistikleri - Gifted Pie Chart */}
            <View style={styles.pieChartContainer}>
                <GiftedPieChart
                    data={reportData.paymentStats}
                    donut
                    showText
                    textColor={chartColors.text}
                    radius={120}
                    textSize={12}
                    strokeWidth={2}
                    strokeColor={chartColors.background}
                />
            </View>

            {/* Şikayet Analizi - Bar Chart */}
            <BarChart
                data={{
                    labels: reportData.complaintAnalytics.data.map(item => item.month),
                    datasets: [{
                        data: reportData.complaintAnalytics.data.map(item => item.complaints)
                    }]
                }}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
            />

            {/* Gider Kategorileri - Bar Chart */}
            <BarChart
                data={{
                    labels: reportData.expenseCategories.map(item => item.category),
                    datasets: [{
                        data: reportData.expenseCategories.map(item => item.amount)
                    }]
                }}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
            />

            {/* Bezier Line Chart */}
            {reportData?.bezierLineData && (
                <LineChart
                    data={reportData.bezierLineData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={darkChartConfig}
                    bezier
                    style={styles.chart}
                />
            )}

            {/* Progress Chart */}
            {reportData?.progressData && (
                <ProgressChart
                    data={reportData.progressData}
                    width={screenWidth - 40}
                    height={220}
                    strokeWidth={16}
                    radius={32}
                    chartConfig={darkChartConfig}
                    hideLegend={false}
                    style={styles.chart}
                />
            )}

            {/* Bar Chart */}
            <BarChart
                data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    datasets: [{
                        data: [20, 45, 28, 80, 99, 43]
                    }]
                }}
                width={screenWidth - 40}
                height={220}
                chartConfig={darkChartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
            />

            {/* Contribution Graph */}
            {reportData?.contributionData && (
                <ContributionGraph
                    values={reportData.contributionData}
                    endDate={new Date("2024-02-02")}
                    numDays={105}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={darkChartConfig}
                    style={styles.chart}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: chartColors.background,
        padding: 16,
    },
    chart: {
        marginVertical: 16,
        borderRadius: 16,
    },
    pieChartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginVertical: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
        padding: 20,
    },
    errorText: {
        color: colors.palette.error.main,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryText: {
        color: colors.palette.primary.main,
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});

export default AdminReport;
