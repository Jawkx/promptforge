export const generateContextHash = (title: string, content: string): string => {
  const dataString = JSON.stringify({
    title,
    content,
  });

  let hash = 5381;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = (hash << 5) + hash + char; /* hash * 33 + char */
    hash = hash & hash; // Convert to 32bit integer
  }
  return String(hash >>> 0); // Ensure positive integer string
};
