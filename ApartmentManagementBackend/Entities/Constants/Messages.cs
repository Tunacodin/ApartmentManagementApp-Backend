namespace Entities.Constants
{
    public static class Messages
    {
        public static class Success
        {
            public const string Added = "Successfully added.";
            public const string Updated = "Successfully updated.";
            public const string Deleted = "Successfully deleted.";
        }

        public static class Error
        {
            public const string NotFound = "Record not found.";
            public const string AlreadyExists = "Record already exists.";
            public const string ValidationError = "Validation error occurred.";
        }
    }
} 