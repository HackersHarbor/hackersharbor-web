function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const navigatorConfig = {
  get apiKey(): string {
    return requiredEnv("OPENAI_API_KEY");
  },

  get model(): string {
    return requiredEnv("OPENAI_MODEL");
  },

  maxMessages: 20,
  maxMessageLength: 8000,
  maxRequestLength: 30000,

  plans: {
    free: {
      dailyLimit: 20,
    },

    pro: {
      dailyLimit: 200,
    },
  },
};
