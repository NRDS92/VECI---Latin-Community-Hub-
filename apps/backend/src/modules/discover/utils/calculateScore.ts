export const calculateScore = (
  event: any,
  userLat: number,
  userLng: number,
  favoriteCategories: string[]
) => {

  let score = 0;

  // ⭐ 1. Verificación / tipo
  if (event.verificationStatus === "verified") score += 50;
  if (event.eventType === "official") score += 20;

  // 📅 2. Proximidad temporal
  const now = new Date().getTime();
  const eventTime = new Date(event.dateStart).getTime();
  const diffDays = (eventTime - now) / (1000 * 60 * 60 * 24);

  if (diffDays >= 0 && diffDays <= 7) score += 30;
  else if (diffDays <= 30) score += 10;

  // 📍 3. Distancia (simple)
  const [lng, lat] = event.location.coordinates;

  const distance = Math.sqrt(
    Math.pow(lat - userLat, 2) +
    Math.pow(lng - userLng, 2)
  );

  score += Math.max(0, 20 - distance * 100);

  // ❤️ 4. Afinidad (favoritos)
  if (favoriteCategories.includes(event.category)) {
    score += 40;
  }

  return score;
};