export const MAX_FILE_SIZE = 1_048_576 * 4;
export const MAX_FILE_NAME_LENGTH = 200;
export const MAX_FILE_NUMBER_UPLOAD_LIMIT =
  process.env.NODE_ENV === "production" ? 5 : 20;

export const VALID_DOCUMENT_MIME_TYPES = ["application/pdf"];

export const MAX_CONTEXT_CHAT_HISTORY = 50;
