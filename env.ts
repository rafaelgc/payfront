export function getenv(key: string, defaultValue: any): string {
    return process.env[key] || defaultValue;
}