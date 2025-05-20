/**
 * API Endpoints Documentation
 * 
 * 1. Meeting Endpoints
 * -------------------
 * Create Meeting:
 * POST /api/Meeting
 * 
 * Request Body:
 * {
 *   buildingId: number,          // Required: ID of the building
 *   title: string,               // Required: Meeting title
 *   description: string,         // Required: Meeting description
 *   meetingDate: string,         // Required: ISO date format (YYYY-MM-DDTHH:mm:ss)
 *   location: string,            // Required: Meeting location
 *   organizedById: number,       // Required: ID of the organizer
 *   organizedByName: string,     // Required: Name of the organizer
 *   status: string              // Required: One of ["Scheduled", "InProgress", "Completed", "Cancelled"]
 * }
 * 
 * Example Usage:
 * const createMeeting = async (meetingData) => {
 *   try {
 *     const response = await fetch('/api/Meeting', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Authorization': `Bearer ${token}` // Include your auth token
 *       },
 *       body: JSON.stringify(meetingData)
 *     });
 *     return await response.json();
 *   } catch (error) {
 *     console.error('Error creating meeting:', error);
 *     throw error;
 *   }
 * };
 * 
 * 2. Notification/Announcement Endpoints
 * ------------------------------------
 * Create Notification:
 * POST /api/Admin/notifications
 * 
 * Request Body:
 * {
 *   title: string,              // Required: Notification title
 *   message: string,            // Required: Notification content
 *   createdByAdminId: number,   // Required: ID of the admin creating the notification
 *   userId: number              // Required: 0 for all users, or specific user ID
 * }
 * 
 * Example Usage:
 * const createNotification = async (notificationData) => {
 *   try {
 *     const response = await fetch('/api/Admin/notifications', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Authorization': `Bearer ${token}` // Include your auth token
 *       },
 *       body: JSON.stringify(notificationData)
 *     });
 *     return await response.json();
 *   } catch (error) {
 *     console.error('Error creating notification:', error);
 *     throw error;
 *   }
 * };
 * 
 * Sending Notifications to Specific Building:
 * -----------------------------------------
 * To send notifications to all users in a specific building:
 * 
 * 1. First get all tenants in the building:
 * GET /api/Tenant/building/{buildingId}
 * 
 * 2. Then create notifications for each tenant:
 * 
 * Example Usage:
 * const sendNotificationToBuilding = async (buildingId, notificationData) => {
 *   try {
 *     // Get all tenants in the building
 *     const response = await fetch(`/api/Tenant/building/${buildingId}`, {
 *       method: 'GET',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Authorization': `Bearer ${token}`
 *       }
 *     });
 *     
 *     const tenants = await response.json();
 *     
 *     // Create notification for each tenant
 *     for (const tenant of tenants) {
 *       const notification = {
 *         title: notificationData.title,
 *         message: notificationData.message,
 *         createdByAdminId: notificationData.adminId,
 *         userId: tenant.id
 *       };
 *       
 *       await fetch('/api/Admin/notifications', {
 *         method: 'POST',
 *         headers: {
 *           'Content-Type': 'application/json',
 *           'Authorization': `Bearer ${token}`
 *         },
 *         body: JSON.stringify(notification)
 *       });
 *     }
 *     
 *     return { success: true, message: 'Notifications sent successfully' };
 *   } catch (error) {
 *     console.error('Error sending notifications:', error);
 *     throw error;
 *   }
 * };
 * 
 * Important Notes:
 * 1. Always include authentication token in the headers
 * 2. For notifications, use userId: 0 to send to all users
 * 3. Meeting dates must be in ISO format
 * 4. All required fields must be provided
 * 5. Response will include success/failure status and relevant data
 * 6. When sending to a specific building, notifications are created individually for each tenant
 */ 