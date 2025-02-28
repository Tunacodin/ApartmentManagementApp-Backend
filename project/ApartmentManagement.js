{
  "info": {
    "_postman_id": "e5a21f8c-3b4d-4e5c-9f8d-8f2e3a7b4c5d",
    "name": "Apartment Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Admin",
      "item": [
        {
          "name": "Initialize First Admin",
          "request": {
            "method": "POST",
            "url": {
              "raw": "{{baseUrl}}/api/admin/initialize"
            },
            "body": {
              "mode": "raw",
              "raw": "{\n  \"fullName\": \"Admin User\",\n  \"email\": \"admin@example.com\",\n  \"phoneNumber\": \"5551234567\",\n  \"password\": \"Admin123!\",\n  \"profileImageUrl\": \"https://example.com/admin.jpg\",\n  \"description\": \"System Administrator\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Get All Admins",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin"
          }
        },
        {
          "name": "Get Admin By Id",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/{{adminId}}"
          }
        },
        {
          "name": "Update Admin",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/admin",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"id\": 1,\n  \"fullName\": \"Updated Admin\",\n  \"email\": \"admin@example.com\",\n  \"phoneNumber\": \"5551234567\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    },
    {
      "name": "Admin Reports",
      "item": [
        {
          "name": "Get Monthly Income",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/reports/monthly-income/{{adminId}}"
          }
        },
        {
          "name": "Get Payment Statistics",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/reports/payment-statistics/{{adminId}}"
          }
        },
        {
          "name": "Get Complaint Analytics",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/reports/complaint-analytics/{{adminId}}"
          }
        },
        {
          "name": "Get Occupancy Rates",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/reports/occupancy-rates/{{adminId}}"
          }
        },
        {
          "name": "Get Meeting Statistics",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/admin/reports/meeting-statistics/{{adminId}}"
          }
        }
      ]
    },
    {
      "name": "Complaints",
      "item": [
        {
          "name": "Get Building Complaints",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/complaint/building/{{buildingId}}"
          }
        },
        {
          "name": "Get Complaint Detail",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/complaint/{{complaintId}}"
          }
        },
        {
          "name": "Get User Complaints",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/complaint/user/{{userId}}"
          }
        },
        {
          "name": "Create Complaint",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/complaint",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"userId\": 1,\n  \"buildingId\": 1,\n  \"subject\": \"Test Complaint\",\n  \"description\": \"This is a test complaint\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Resolve Complaint",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/complaint/{{complaintId}}/resolve/{{adminId}}"
          }
        },
        {
          "name": "Delete Complaint",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/complaint/{{complaintId}}"
          }
        }
      ]
    },
    {
      "name": "Meetings",
      "item": [
        {
          "name": "Get Building Meetings",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/meeting/building/{{buildingId}}"
          }
        },
        {
          "name": "Get Meeting Detail",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/meeting/{{meetingId}}"
          }
        },
        {
          "name": "Get Upcoming Meetings",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/meeting/building/{{buildingId}}/upcoming"
          }
        },
        {
          "name": "Create Meeting",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/meeting",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Test Meeting\",\n  \"description\": \"This is a test meeting\",\n  \"meetingDate\": \"2024-03-20T14:00:00\",\n  \"buildingId\": 1,\n  \"organizedById\": 1,\n  \"location\": \"Meeting Room 1\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Cancel Meeting",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/meeting/{{meetingId}}/cancel",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reason\": \"Meeting cancelled due to emergency\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Delete Meeting",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/meeting/{{meetingId}}"
          }
        }
      ]
    },
    {
      "name": "Notifications",
      "item": [
        {
          "name": "Get User Notifications",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/notification/user/{{userId}}"
          }
        },
        {
          "name": "Get Unread Notifications",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/notification/unread/{{userId}}"
          }
        },
        {
          "name": "Get Unread Count",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/notification/unread/count/{{userId}}"
          }
        },
        {
          "name": "Mark As Read",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/notification/{{notificationId}}/read"
          }
        },
        {
          "name": "Mark All As Read",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/notification/user/{{userId}}/read-all"
          }
        },
        {
          "name": "Create Notification",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/notification",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Test Notification\",\n  \"message\": \"This is a test notification\",\n  \"userId\": 1,\n  \"createdByAdminId\": 1\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Delete Notification",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/notification/{{notificationId}}"
          }
        }
      ]
    },
    {
      "name": "User",
      "item": [
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/user"
            }
          }
        },
        {
          "name": "Get User By Id",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/user/{{userId}}"
          }
        },
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/user",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"email\": \"john@example.com\",\n  \"phoneNumber\": \"5551234567\",\n  \"password\": \"Test123!\",\n  \"role\": \"tenant\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Update User",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/user",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"id\": 1,\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"email\": \"john@example.com\",\n  \"phoneNumber\": \"5551234567\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Delete User",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/user/{{userId}}"
          }
        }
      ]
    },
    {
      "name": "Tenant",
      "item": [
        {
          "name": "Get All Tenants",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/tenant"
          }
        },
        {
          "name": "Get Tenant By Id",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/tenant/{{tenantId}}"
          }
        },
        {
          "name": "Create Tenant",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/tenant",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"email\": \"john@example.com\",\n  \"phoneNumber\": \"5551234567\",\n  \"apartmentId\": 1,\n  \"leaseStartDate\": \"2024-03-01\",\n  \"leaseEndDate\": \"2025-03-01\",\n  \"monthlyRent\": 5000,\n  \"monthlyDues\": 500\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Update Tenant",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/tenant",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"id\": 1,\n  \"apartmentId\": 1,\n  \"leaseStartDate\": \"2024-03-01\",\n  \"leaseEndDate\": \"2025-03-01\",\n  \"monthlyRent\": 5000,\n  \"monthlyDues\": 500\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    },
    {
      "name": "Apartment",
      "item": [
        {
          "name": "Get All Apartments",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/apartment"
          }
        },
        {
          "name": "Get Apartment By Id",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/apartment/{{apartmentId}}"
          }
        },
        {
          "name": "Get Building Apartments",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/apartment/building/{{buildingId}}"
          }
        },
        {
          "name": "Create Apartment",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/apartment",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"buildingId\": 1,\n  \"ownerId\": 1,\n  \"unitNumber\": 1,\n  \"floor\": 1,\n  \"type\": \"2+1\",\n  \"rentAmount\": 5000,\n  \"depositAmount\": 5000,\n  \"hasBalcony\": true,\n  \"notes\": \"Sample apartment\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Update Apartment",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/apartment",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"id\": 1,\n  \"buildingId\": 1,\n  \"ownerId\": 1,\n  \"unitNumber\": 1,\n  \"floor\": 1,\n  \"type\": \"2+1\",\n  \"rentAmount\": 5000,\n  \"depositAmount\": 5000,\n  \"hasBalcony\": true,\n  \"notes\": \"Updated apartment\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Delete Apartment",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/apartment/{{apartmentId}}"
          }
        }
      ]
    },
    {
      "name": "Building",
      "item": [
        {
          "name": "Get All Buildings",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/building"
            }
          }
        },
        {
          "name": "Get Building By Id",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/building/{{buildingId}}"
          }
        },
        {
          "name": "Create Building",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/building",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"buildingName\": \"Sample Building\",\n  \"numberOfFloors\": 5,\n  \"totalApartments\": 20,\n  \"city\": \"Istanbul\",\n  \"district\": \"Kadikoy\",\n  \"neighborhood\": \"Caferaga\",\n  \"street\": \"Sample St.\",\n  \"buildingNumber\": \"10\",\n  \"postalCode\": \"34710\",\n  \"duesAmount\": 500,\n  \"adminId\": 1\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Update Building",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/building",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"id\": 1,\n  \"buildingName\": \"Updated Building\",\n  \"numberOfFloors\": 5,\n  \"totalApartments\": 20,\n  \"duesAmount\": 600,\n  \"adminId\": 1\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Delete Building",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/building/{{buildingId}}"
          }
        }
      ]
    },
    {
      "name": "User Profile",
      "item": [
        {
          "name": "Get User Profile",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/userprofile/{{userId}}"
          }
        },
        {
          "name": "Update Display Name",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/userprofile/{{userId}}/displayname",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"fullName\": \"John Doe\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Update Profile",
          "request": {
            "method": "PUT",
            "url": "{{baseUrl}}/api/userprofile/{{userId}}",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"phoneNumber\": \"5551234567\",\n  \"email\": \"john@example.com\",\n  \"profileImageUrl\": \"https://example.com/profile.jpg\",\n  \"description\": \"Sample description\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    }
  ]
} 