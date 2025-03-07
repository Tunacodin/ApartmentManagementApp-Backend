import apiConfig from '../apiConfig';

export const fetchDashboardData = async (adminId) => {
  try {
    const [
      statistics,
      activities,
      buildings,
      financials
    ] = await Promise.all([
      fetch(apiConfig.admin.getStatistics(adminId)).then(res => res.json()),
      fetch(apiConfig.admin.getRecentActivities(adminId)).then(res => res.json()),
      fetch(apiConfig.admin.getManagedBuildings(adminId)).then(res => res.json()),
      fetch(apiConfig.admin.getFinancialSummaries(adminId)).then(res => res.json())
    ]);

    return {
      statistics: statistics.data,
      activities: activities.data,
      buildings: buildings.data,
      financials: financials.data
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}; 