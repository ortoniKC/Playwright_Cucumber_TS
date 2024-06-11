export function normalizeUrl(url: string): string {
    return new URL(url).href;
}