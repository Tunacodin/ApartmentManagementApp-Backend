/**
 * Survey Endpoints
 * 
 * Create Survey
 * POST /api/Survey?adminId={adminId}
 * 
 * Request Body:
 * {
 *   "title": "string",
 *   "description": "string",
 *   "startDate": "2024-03-20T00:00:00",
 *   "endDate": "2024-03-27T00:00:00",
 *   "buildingIds": [1, 2, 3], // List of building IDs
 *   "questions": [
 *     {
 *       "questionText": "string",
 *       "questionType": "MultipleChoice",
 *       "isRequired": true,
 *       "options": ["Option 1", "Option 2", "Option 3"]
 *     }
 *   ]
 * }
 * 
 * Example usage:
 * const createSurvey = async (adminId, surveyData) => {
 *   try {
 *     const response = await fetch(`${API_BASE_URL}/api/Survey?adminId=${adminId}`, {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Authorization': `Bearer ${token}`
 *       },
 *       body: JSON.stringify(surveyData)
 *     });
 *     
 *     if (!response.ok) {
 *       throw new Error('Failed to create survey');
 *     }
 *     
 *     return await response.json();
 *   } catch (error) {
 *     console.error('Error creating survey:', error);
 *     throw error;
 *   }
 * };
 * 
 * // Example survey data
 * const surveyData = {
 *   title: "Bina Yönetimi Anketi",
 *   description: "Bina yönetimi hakkında görüşlerinizi almak istiyoruz",
 *   startDate: "2024-03-20T00:00:00",
 *   endDate: "2024-03-27T00:00:00",
 *   buildingIds: [1, 2, 3], // Multiple building IDs
 *   questions: [
 *     {
 *       questionText: "Bina yönetiminden memnun musunuz?",
 *       questionType: "MultipleChoice",
 *       isRequired: true,
 *       options: ["Evet", "Hayır", "Kısmen"]
 *     }
 *   ]
 * };
 */ 