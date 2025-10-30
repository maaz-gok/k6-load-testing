export function generateRandomEmail() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 100000);
  return `maaz+${timestamp}_${randomNum}@geeksofkolachi.com`;
}
