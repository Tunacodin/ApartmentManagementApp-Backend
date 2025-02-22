-- Reset Identity columns and clear existing data
DELETE FROM Notifications;
DELETE FROM Complaints;
DELETE FROM Meetings;
DELETE FROM Payments;
DELETE FROM Apartments;
DELETE FROM Buildings;
DELETE FROM Users;
DBCC CHECKIDENT ('Users', RESEED, 0);
DBCC CHECKIDENT ('Buildings', RESEED, 0);
DBCC CHECKIDENT ('Apartments', RESEED, 0);
DBCC CHECKIDENT ('Payments', RESEED, 0);
DBCC CHECKIDENT ('Meetings', RESEED, 0);
DBCC CHECKIDENT ('Complaints', RESEED, 0);
DBCC CHECKIDENT ('Notifications', RESEED, 0);

-- Insert Users (2 admins, 2 owners, 10 tenants, 2 security)
INSERT INTO Users (FirstName, LastName, Email, Password, PhoneNumber, Role, CreatedAt, EmailVerified, LastLoginDate, IsActive)
VALUES 
-- Admins
('John', 'Admin', 'john.admin@example.com', 'hashed_password_123', '5551112233', 'admin', GETDATE(), 1, GETDATE(), 1),
('Sarah', 'Admin', 'sarah.admin@example.com', 'hashed_password_124', '5551112234', 'admin', GETDATE(), 1, GETDATE(), 1),

-- Owners
('Michael', 'Owner', 'michael.owner@example.com', 'hashed_password_125', '5551112235', 'owner', GETDATE(), 1, GETDATE(), 1),
('Lisa', 'Owner', 'lisa.owner@example.com', 'hashed_password_126', '5551112236', 'owner', GETDATE(), 1, GETDATE(), 1),

-- Tenants
('James', 'Tenant', 'james.tenant@example.com', 'hashed_password_127', '5551112237', 'tenant', GETDATE(), 1, GETDATE(), 1),
('Emma', 'Tenant', 'emma.tenant@example.com', 'hashed_password_128', '5551112238', 'tenant', GETDATE(), 1, GETDATE(), 1),
('David', 'Tenant', 'david.tenant@example.com', 'hashed_password_129', '5551112239', 'tenant', GETDATE(), 1, GETDATE(), 1),
('Sophie', 'Tenant', 'sophie.tenant@example.com', 'hashed_password_130', '5551112240', 'tenant', GETDATE(), 1, GETDATE(), 1),
('Oliver', 'Tenant', 'oliver.tenant@example.com', 'hashed_password_131', '5551112241', 'tenant', GETDATE(), 1, GETDATE(), 1),
('Mia', 'Tenant', 'mia.tenant@example.com', 'hashed_password_132', '5551112242', 'tenant', GETDATE(), 1, GETDATE(), 1),
('William', 'Tenant', 'william.tenant@example.com', 'hashed_password_133', '5551112243', 'tenant', GETDATE(), 1, GETDATE(), 1),
('Ava', 'Tenant', 'ava.tenant@example.com', 'hashed_password_134', '5551112244', 'tenant', GETDATE(), 1, GETDATE(), 1),
('Lucas', 'Tenant', 'lucas.tenant@example.com', 'hashed_password_135', '5551112245', 'tenant', GETDATE(), 1, GETDATE(), 1),
('Isabella', 'Tenant', 'isabella.tenant@example.com', 'hashed_password_136', '5551112246', 'tenant', GETDATE(), 1, GETDATE(), 1),

-- Security
('Mark', 'Security', 'mark.security@example.com', 'hashed_password_137', '5551112247', 'security', GETDATE(), 1, GETDATE(), 1),
('Anna', 'Security', 'anna.security@example.com', 'hashed_password_138', '5551112248', 'security', GETDATE(), 1, GETDATE(), 1);

-- Insert Buildings (2 buildings, 6 floors each)
INSERT INTO Buildings (BuildingName, NumberOfFloors, TotalApartments, OccupancyRate, City, District, Neighborhood, Street, BuildingNumber, 
                      PostalCode, DuesAmount, IncludedElectric, IncludedWater, IncludedGas, IncludedInternet, ParkingType, HasElevator, 
                      HasPlayground, HeatingType, PoolType, HasGym, BuildingAge, HasGarden, HasThermalInsulation, AdminId, CreatedAt, 
                      ImageUrl, IsActive, LastMaintenanceDate)
VALUES 
('Sunset Residence', 6, 12, 90.0, 'Istanbul', 'Kadikoy', 'Caddebostan', 'Bagdat Street', '123', '34728', 
 1000.00, 1, 1, 1, 1, 'Underground', 1, 1, 'Central', 'Outdoor', 1, 5, 1, 1, 1, GETDATE(), 
 'building1.jpg', 1, GETDATE()),
('Ocean View', 6, 12, 85.0, 'Istanbul', 'Besiktas', 'Levent', 'Buyukdere Street', '456', '34330', 
 1200.00, 1, 1, 1, 1, 'Open', 1, 1, 'Central', 'Indoor', 1, 3, 1, 1, 2, GETDATE(), 
 'building2.jpg', 1, GETDATE());

-- Insert Apartments (12 apartments per building, 2 per floor)
INSERT INTO Apartments (BuildingId, OwnerId, UnitNumber, Floor, Type, RentAmount, DepositAmount, HasBalcony, Status, CreatedAt, IsActive, IsOccupied)
VALUES 
-- Building 1 Apartments
(1, 3, 1, 1, '2+1', 5000.00, 5000.00, 1, 'Occupied', GETDATE(), 1, 1),
(1, 3, 2, 1, '2+1', 5000.00, 5000.00, 1, 'Occupied', GETDATE(), 1, 1),
(1, 3, 3, 2, '2+1', 5500.00, 5500.00, 1, 'Occupied', GETDATE(), 1, 1),
(1, 3, 4, 2, '2+1', 5500.00, 5500.00, 1, 'Occupied', GETDATE(), 1, 1),
(1, 3, 5, 3, '3+1', 6000.00, 6000.00, 1, 'Occupied', GETDATE(), 1, 1),
(1, 3, 6, 3, '3+1', 6000.00, 6000.00, 1, 'Occupied', GETDATE(), 1, 1),
(1, 3, 7, 4, '3+1', 6500.00, 6500.00, 1, 'Occupied', GETDATE(), 1, 1),
(1, 3, 8, 4, '3+1', 6500.00, 6500.00, 1, 'Occupied', GETDATE(), 1, 1),
(1, 3, 9, 5, '4+1', 7000.00, 7000.00, 1, 'Occupied', GETDATE(), 1, 1),
(1, 3, 10, 5, '4+1', 7000.00, 7000.00, 1, 'Occupied', GETDATE(), 1, 1),
(1, 3, 11, 6, '4+1', 7500.00, 7500.00, 1, 'Vacant', GETDATE(), 1, 0),
(1, 3, 12, 6, '4+1', 7500.00, 7500.00, 1, 'Vacant', GETDATE(), 1, 0),

-- Building 2 Apartments
(2, 4, 1, 1, '2+1', 5200.00, 5200.00, 1, 'Occupied', GETDATE(), 1, 1),
(2, 4, 2, 1, '2+1', 5200.00, 5200.00, 1, 'Occupied', GETDATE(), 1, 1),
(2, 4, 3, 2, '2+1', 5700.00, 5700.00, 1, 'Occupied', GETDATE(), 1, 1),
(2, 4, 4, 2, '2+1', 5700.00, 5700.00, 1, 'Occupied', GETDATE(), 1, 1),
(2, 4, 5, 3, '3+1', 6200.00, 6200.00, 1, 'Occupied', GETDATE(), 1, 1),
(2, 4, 6, 3, '3+1', 6200.00, 6200.00, 1, 'Occupied', GETDATE(), 1, 1),
(2, 4, 7, 4, '3+1', 6700.00, 6700.00, 1, 'Occupied', GETDATE(), 1, 1),
(2, 4, 8, 4, '3+1', 6700.00, 6700.00, 1, 'Occupied', GETDATE(), 1, 1),
(2, 4, 9, 5, '4+1', 7200.00, 7200.00, 1, 'Occupied', GETDATE(), 1, 1),
(2, 4, 10, 5, '4+1', 7200.00, 7200.00, 1, 'Occupied', GETDATE(), 1, 1),
(2, 4, 11, 6, '4+1', 7700.00, 7700.00, 1, 'Vacant', GETDATE(), 1, 0),
(2, 4, 12, 6, '4+1', 7700.00, 7700.00, 1, 'Vacant', GETDATE(), 1, 0);

-- Insert Payments
INSERT INTO Payments (UserId, BuildingId, ApartmentId, PaymentType, Amount, PaymentDate, DueDate, IsPaid, Description, UserFullName)
SELECT TOP 50
    u.Id as UserId,
    a.BuildingId,
    a.Id as ApartmentId,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY NEWID()) % 2 = 0 THEN 'Dues' ELSE 'Rent' END as PaymentType,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY NEWID()) % 2 = 0 THEN 1000 ELSE a.RentAmount END as Amount,
    DATEADD(day, -ROW_NUMBER() OVER (ORDER BY NEWID()), GETDATE()) as PaymentDate,
    DATEADD(day, 30, GETDATE()) as DueDate,
    CASE WHEN ROW_NUMBER() OVER (ORDER BY NEWID()) % 3 = 0 THEN 0 ELSE 1 END as IsPaid,
    'Monthly Payment' as Description,
    CONCAT(u.FirstName, ' ', u.LastName) as UserFullName
FROM Users u
CROSS JOIN Apartments a
WHERE u.Role = 'tenant'
ORDER BY NEWID();

-- Insert Meetings
INSERT INTO Meetings (BuildingId, Title, Description, MeetingDate, CreatedAt, OrganizedById, OrganizedByName, Location, Status, IsCancelled, AttendanceRate)
VALUES 
(1, 'Monthly Building Meeting', 'Discussion about building maintenance', DATEADD(day, 7, GETDATE()), GETDATE(), 1, 'John Admin', 'Building 1 Meeting Room', 'Scheduled', 0, 0),
(1, 'Security Meeting', 'Review of security measures', DATEADD(day, 14, GETDATE()), GETDATE(), 1, 'John Admin', 'Building 1 Lobby', 'Scheduled', 0, 0),
(2, 'Monthly Building Meeting', 'Discussion about building improvements', DATEADD(day, 8, GETDATE()), GETDATE(), 2, 'Sarah Admin', 'Building 2 Meeting Room', 'Scheduled', 0, 0),
(2, 'Emergency Meeting', 'Discuss urgent repairs', DATEADD(day, -1, GETDATE()), GETDATE(), 2, 'Sarah Admin', 'Building 2 Lobby', 'Completed', 0, 85.5);

-- Insert Complaints
INSERT INTO Complaints (UserId, BuildingId, Subject, Description, CreatedAt, IsResolved, IsInProgress, ResolvedByAdminId, ResolvedAt, CreatedByName)
VALUES 
(5, 1, 'Noise Complaint', 'Loud noise from upper floor', DATEADD(day, -5, GETDATE()), 1, 0, 1, GETDATE(), 'James Tenant'),
(6, 1, 'Water Leak', 'Water leaking in bathroom', DATEADD(day, -3, GETDATE()), 0, 1, NULL, NULL, 'Emma Tenant'),
(7, 2, 'Elevator Issue', 'Elevator making strange sounds', DATEADD(day, -2, GETDATE()), 0, 1, NULL, NULL, 'David Tenant'),
(8, 2, 'Parking Problem', 'Unauthorized vehicle in my spot', DATEADD(day, -1, GETDATE()), 1, 0, 2, GETDATE(), 'Sophie Tenant');

-- Insert Notifications
INSERT INTO Notifications (Title, Message, UserId, CreatedByAdminId, CreatedAt, IsRead)
VALUES 
('Payment Reminder', 'Your monthly dues payment is due in 5 days', 5, 1, GETDATE(), 0),
('Meeting Announcement', 'Monthly building meeting scheduled for next week', 6, 1, GETDATE(), 1),
('Maintenance Notice', 'Water will be shut off for maintenance tomorrow', 7, 2, GETDATE(), 0),
('Security Alert', 'Please ensure all doors are properly locked', 8, 2, GETDATE(), 1),
('Welcome Message', 'Welcome to our building community!', 9, 1, DATEADD(day, -7, GETDATE()), 1); 