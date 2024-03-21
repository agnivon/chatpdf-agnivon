import {
  MAX_FILE_NAME_LENGTH,
  MAX_FILE_SIZE,
  VALID_DOCUMENT_MIME_TYPES,
} from "@/constants/validation.constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fileSizeValidator(file: File) {
  if (file.size > MAX_FILE_SIZE) {
    return {
      code: "size-too-large",
      message: `Size is larger than ${MAX_FILE_SIZE} bytes`,
    };
  }

  return null;
}

export function filenameLengthValidator(file: File) {
  if (file.name.length > MAX_FILE_NAME_LENGTH) {
    return {
      code: "name-too-large",
      message: `Name is larger than ${MAX_FILE_NAME_LENGTH} characters`,
    };
  }

  return null;
}

export function fileTypeValidator(file: File) {
  if (!VALID_DOCUMENT_MIME_TYPES.includes(file.type)) {
    return {
      code: "type-not-supported",
      message: `Type not supported: ${file.type}`,
    };
  }
}

export function fileValidator(file: File) {
  return (
    fileSizeValidator(file) ||
    fileTypeValidator(file) ||
    filenameLengthValidator(file)
  );
}

export function chunkArray<T>(array: T[], batchSize: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += batchSize) {
    chunks.push(array.slice(i, i + batchSize));
  }
  return chunks;
}

export function convertToAscii(inputString: string) {
  // remove non ascii characters
  const asciiString = inputString.replace(/[^\x00-\x7F]+/g, "");
  return asciiString;
}

export function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function isDevEnv() {
  return process.env.NODE_ENV === "development";
}

export function isProdEnv() {
  return process.env.NODE_ENV === "production";
}
