export const supportedLocales = ['en', 'it'] as const;

export type SupportedLocales = (typeof supportedLocales)[number];
