/**
 * Upload-related constants
 */

// Allowed file types for document uploads (MIME types)
export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Maximum file size in bytes (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// File extensions for display/validation
export const ALLOWED_EXTENSIONS = ['.txt', '.pdf', '.doc', '.docx'];
