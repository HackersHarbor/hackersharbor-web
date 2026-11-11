
import {
    DATASET_LIMITS,
  } from "../constants/runtime";
  import {
    SUPPORTED_DATASET_FORMATS,
  } from "../constants/file-formats";
  
  export interface ValidationResult {
    valid: boolean;
    errors: string[];
  }
  
  export function validateDatasetFile(file: File): ValidationResult {
    const errors: string[] = [];
    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();
  
    if (!SUPPORTED_DATASET_FORMATS.includes(
      extension as (typeof SUPPORTED_DATASET_FORMATS)[number],
    )) {
      errors.push(`Unsupported dataset format: ${extension || "unknown"}.`);
    }
  
    if (file.size === 0) {
      errors.push("The selected file is empty.");
    }
  
    if (file.size > DATASET_LIMITS.maxFileSizeBytes) {
      errors.push(
        `The file exceeds the ${DATASET_LIMITS.maxFileSizeBytes / (1024 * 1024)} MB import limit.`,
      );
    }
  
    return {
      valid: errors.length === 0,
      errors,
    };
  }
  