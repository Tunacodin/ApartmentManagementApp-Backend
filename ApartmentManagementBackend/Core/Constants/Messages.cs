namespace Core.Constants
{
    public static class Messages
    {
        // Common Messages
        public const string Success = "İşlem başarılı";
        public const string ValidationFailed = "Doğrulama başarısız";
        public const string UnexpectedError = "Beklenmeyen bir hata oluştu";
        public const string IdMismatch = "URL ve istek gövdesindeki ID'ler eşleşmiyor";
        public const string NotFound = "Kayıt bulunamadı";
        public const string Added = "Kayıt başarıyla eklendi";
        public const string Updated = "Kayıt başarıyla güncellendi";
        public const string Deleted = "Kayıt başarıyla silindi";
        public const string Retrieved = "Kayıt başarıyla getirildi";
        public const string Listed = "Kayıtlar başarıyla listelendi";

        // Admin Messages
        public const string AdminNotFound = "Yönetici bulunamadı";
        public const string AdminsListed = "Yöneticiler listelendi";
        public const string AdminAdded = "Yönetici başarıyla eklendi";
        public const string AdminUpdated = "Yönetici başarıyla güncellendi";
        public const string AdminDeleted = "Yönetici başarıyla silindi";
        public const string AdminRetrieved = "Yönetici bilgileri getirildi";
        public const string BuildingAssigned = "Bina yöneticiye atandı";
        public const string BuildingUnassigned = "Bina yöneticiden alındı";
        public const string ProfileUpdated = "Profil güncellendi";
        public const string ContactInfoUpdated = "İletişim bilgileri güncellendi";
        public const string PasswordUpdated = "Şifre güncellendi";
        public const string InvalidCurrentPassword = "Mevcut şifre hatalı";
        public const string AdminDashboardRetrieved = "Yönetici paneli bilgileri getirildi";
        public const string AdminActivitiesListed = "Yönetici aktiviteleri listelendi";
        public const string AdminFinancialSummaryRetrieved = "Finansal özet bilgileri getirildi";
        public const string AdminBuildingsListed = "Yönetilen binalar listelendi";
        public const string AdminStatisticsRetrieved = "Yönetici istatistikleri getirildi";

        // User Messages
        public const string UserNotFound = "Kullanıcı bulunamadı";
        public const string UsersListed = "Kullanıcılar listelendi";
        public const string UserAdded = "Kullanıcı başarıyla eklendi";
        public const string UserUpdated = "Kullanıcı başarıyla güncellendi";
        public const string UserDeleted = "Kullanıcı başarıyla silindi";
        public const string InvalidCredentials = "Geçersiz kullanıcı adı veya şifre";
        public const string UserAlreadyExists = "Bu email adresi zaten kayıtlı";

        // Tenant Messages
        public const string TenantNotFound = "Kiracı bulunamadı";
        public const string TenantsRetrieved = "Kiracılar başarıyla listelendi";
        public const string TenantRetrieved = "Kiracı bilgileri getirildi";
        public const string TenantAdded = "Kiracı başarıyla eklendi";
        public const string TenantUpdated = "Kiracı bilgileri güncellendi";
        public const string TenantDeleted = "Kiracı kaydı silindi";
        public const string TenantIdMismatch = "Kiracı ID'leri eşleşmiyor";

        // Owner Messages
        public const string OwnerNotFound = "Ev sahibi bulunamadı";
        public const string OwnersListed = "Ev sahipleri listelendi";
        public const string OwnerAdded = "Ev sahibi başarıyla eklendi";
        public const string OwnerUpdated = "Ev sahibi bilgileri güncellendi";
        public const string OwnerDeleted = "Ev sahibi kaydı silindi";

        // Building Messages
        public const string BuildingNotFound = "Bina bulunamadı";
        public const string BuildingsListed = "Binalar listelendi";
        public const string BuildingAdded = "Bina başarıyla eklendi";
        public const string BuildingUpdated = "Bina bilgileri güncellendi";
        public const string BuildingDeleted = "Bina kaydı silindi";
        public const string BuildingRetrieved = "Bina bilgileri getirildi";
        public const string BuildingImageUpdated = "Bina resmi güncellendi";

        // Apartment Messages
        public const string ApartmentNotFound = "Daire bulunamadı";
        public const string ApartmentsListed = "Daireler listelendi";
        public const string ApartmentAdded = "Daire başarıyla eklendi";
        public const string ApartmentUpdated = "Daire bilgileri güncellendi";
        public const string ApartmentDeleted = "Daire kaydı silindi";
        public const string ApartmentOccupied = "Daire şu anda dolu";

        // Payment Messages
        public const string PaymentNotFound = "Ödeme bulunamadı";
        public const string PaymentsListed = "Ödemeler listelendi";
        public const string PaymentAdded = "Ödeme başarıyla eklendi";
        public const string PaymentUpdated = "Ödeme bilgileri güncellendi";
        public const string PaymentDeleted = "Ödeme kaydı silindi";
        public const string PaymentFailed = "Ödeme işlemi başarısız";
        public const string PaymentSuccessful = "Ödeme işlemi başarılı";
        public const string PaymentDelayed = "Ödeme gecikti, ceza hesaplandı";
        public const string PaymentOnTime = "Ödeme zamanında yapıldı";
        public const string PaymentCancelled = "Ödeme iptal edildi";

        // Meeting Messages
        public const string MeetingNotFound = "Toplantı bulunamadı";
        public const string MeetingsListed = "Toplantılar listelendi";
        public const string MeetingAdded = "Toplantı başarıyla eklendi";
        public const string MeetingUpdated = "Toplantı bilgileri güncellendi";
        public const string MeetingDeleted = "Toplantı kaydı silindi";
        public const string MeetingScheduled = "Toplantı planlandı";
        public const string MeetingCancelled = "Toplantı iptal edildi";

        // Complaint Messages
        public const string ComplaintNotFound = "Şikayet bulunamadı";
        public const string ComplaintsListed = "Şikayetler listelendi";
        public const string ComplaintAdded = "Şikayet başarıyla eklendi";
        public const string ComplaintUpdated = "Şikayet bilgileri güncellendi";
        public const string ComplaintDeleted = "Şikayet kaydı silindi";
        public const string ComplaintResolved = "Şikayet çözüldü";
        public const string ComplaintInProcess = "Şikayet işleme alındı";
        public const string ComplaintCreated = "Yeni şikayet kaydı oluşturuldu";
        public const string ComplaintRetrieved = "Şikayet detayları getirildi";

        // Notification Messages
        public const string NotificationNotFound = "Bildirim bulunamadı";
        public const string NotificationsListed = "Bildirimler listelendi";
        public const string NotificationAdded = "Bildirim başarıyla eklendi";
        public const string NotificationUpdated = "Bildirim güncellendi";
        public const string NotificationDeleted = "Bildirim silindi";
        public const string NotificationSent = "Bildirim gönderildi";
        public const string NotificationMarkedAsRead = "Bildirim okundu olarak işaretlendi";
        public const string AllNotificationsMarkedAsRead = "Tüm bildirimler okundu olarak işaretlendi";
        public const string NotificationCreated = "Yeni bildirim oluşturuldu";

        // Security Messages
        public const string SecurityNotFound = "Güvenlik görevlisi bulunamadı";
        public const string SecurityListed = "Güvenlik görevlileri listelendi";
        public const string SecurityAdded = "Güvenlik görevlisi eklendi";
        public const string SecurityUpdated = "Güvenlik görevlisi güncellendi";
        public const string SecurityDeleted = "Güvenlik görevlisi silindi";
        public const string SecurityAssigned = "Güvenlik görevlisi atandı";

        // Contract Messages
        public const string ContractNotFound = "Sözleşme bulunamadı";
        public const string ContractRetrieved = "Sözleşme bilgileri getirildi";
        public const string ContractsListed = "Sözleşmeler listelendi";
        public const string ContractAdded = "Sözleşme eklendi";
        public const string ContractUpdated = "Sözleşme güncellendi";
        public const string ContractDeleted = "Sözleşme silindi";
        public const string ContractSummaryRetrieved = "Sözleşme özeti getirildi";
        public const string ContractExpired = "Sözleşme süresi doldu";
        public const string ContractActive = "Sözleşme aktif";
        public const string ContractInactive = "Sözleşme pasif";
        public const string ContractCancelled = "Sözleşme iptal edildi";
        public const string ContractNotStarted = "Sözleşme henüz başlamadı";
        public const string ContractExpiringSoon = "Sözleşme yakında sona erecek";
        public const string ContractRenewed = "Sözleşme yenilendi";
        public const string ContractValidationError = "Sözleşme bilgileri geçersiz";
        public const string ContractDatesInvalid = "Sözleşme tarihleri geçersiz";
        public const string ContractAmountInvalid = "Sözleşme tutarı geçersiz";
        public const string ContractFileRequired = "Sözleşme dosyası gerekli";
        public const string ContractFileUploaded = "Sözleşme dosyası yüklendi";
        public const string ContractFileDeleted = "Sözleşme dosyası silindi";

        // Report related messages
        public const string PaymentStatisticsRetrieved = "Ödeme istatistikleri başarıyla getirildi";
        public const string ComplaintAnalyticsRetrieved = "Şikayet analizi başarıyla getirildi";
        public const string OccupancyRatesRetrieved = "Doluluk oranları başarıyla getirildi";
        public const string MeetingStatisticsRetrieved = "Toplantı istatistikleri başarıyla getirildi";
        public const string InvalidAdminId = "Geçersiz admin ID";

        // Newly added message
        public const string BuildingsNotFound = "Yöneticiye ait bina bulunamadı";
        public const string DetailedPaymentStatisticsRetrieved = "Detaylı ödeme istatistikleri başarıyla getirildi";
    }
}