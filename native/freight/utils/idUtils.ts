export function generateUniqueId(): string {
  const timestamp = Date.now().toString();
  const randomPart1 = Math.random().toString(36).substr(2, 9);
  const randomPart2 = Math.random().toString(36).substr(2, 5);
  return `${timestamp}-${randomPart1}-${randomPart2}`;
}
