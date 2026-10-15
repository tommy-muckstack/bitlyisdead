// Privacy-safe location of a request: only the country/city headers the platform already attaches (Vercel), never the IP.
export function geoOf(headers: Headers): { country: string | null; city: string | null } {
  const country = headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? null;
  let city = headers.get("x-vercel-ip-city"); if (city) { try { city = decodeURIComponent(city); } catch { /* keep raw */ } }
  return { country, city };
}
