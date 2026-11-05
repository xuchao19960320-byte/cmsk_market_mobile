export function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
export const chartColors = () =>
  [
    '--color-teal',
    '--color-yellow',
    '--color-gray',
    '--color-blue',
    '--color-coral',
    '--color-cyan',
    '--color-purple',
  ].map(token);
export const propertyColors = () =>
  [
    '--color-property-home',
    '--color-property-shop',
    '--color-property-apartment',
    '--color-property-office',
    '--color-property-parking',
    '--color-property-other',
  ].map(token);
