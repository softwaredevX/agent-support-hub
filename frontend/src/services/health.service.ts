const HEALTH_URL = import.meta.env.VITE_HEALTH_URL ?? "/api/health";

export const healthService = async () => {
  const res = await fetch(HEALTH_URL);
  return res.json();
};
