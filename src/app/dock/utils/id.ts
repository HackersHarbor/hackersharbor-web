
export function createId(prefix = "dock"): string {
    if (
      typeof globalThis.crypto !== "undefined" &&
      typeof globalThis.crypto.randomUUID === "function"
    ) {
      return `${prefix}_${globalThis.crypto.randomUUID()}`;
    }
  
    throw new Error(
      "Secure ID generation is unavailable in this environment.",
    );
  }
  