
import { NextRequest } from "next/server";

const GEOCODE_URL = "https://geocode.googleapis.com/v4beta/geocode/location";
const PLACES_URL = "https://places.googleapis.com/v1/places";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const lang = searchParams.get("languageCode") || "en";
  const region = searchParams.get("regionCode") || "BW";

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return new Response(JSON.stringify({ error: "Invalid lat/lng" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing GOOGLE_MAPS_API_KEY" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // 1) Reverse geocode (v4)
    const revUrl = `${GEOCODE_URL}/${lat},${lng}?languageCode=${lang}&regionCode=${region}`;
    const revRes = await fetch(revUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // Ask only for what we need to keep payloads & costs down
        "X-Goog-FieldMask": "results(placeId,formattedAddress,types,granularity,location),plusCode",
      },
      // For per-user queries, avoid caching:
      cache: "no-store",
    });

    if (!revRes.ok) {
      const body = await revRes.text();
      throw new Error(`Reverse geocode failed: ${revRes.status} ${body}`);
    }

    const revJson = await revRes.json() as any;
    const results: any[] = revJson?.results || [];
    if (!results.length) {
      return new Response(JSON.stringify({ results: [], message: "No matches" }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Prefer a precise street address if available
    const streetIdx = results.findIndex(r => Array.isArray(r.types) && r.types.includes("street_address"));
    const best = streetIdx >= 0 ? results[streetIdx] : results[0];

    const placeId: string | undefined = best?.placeId;
    if (!placeId) {
      // Some reverse results may lack a placeId; just return geocode data.
      return new Response(JSON.stringify({ geocode: best, place: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 2) Place Details (New) – choose a minimal field mask
    const fields = [
      "id",              // standalone placeId
      "displayName",     // text name (Pro SKU)
      "formattedAddress",
      "location",
      "types",
      "googleMapsUri"
    ].join(",");

    const placeRes = await fetch(`${PLACES_URL}/${placeId}?languageCode=${lang}&regionCode=${region}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fields,
      },
      cache: "no-store",
    });

    if (!placeRes.ok) {
      const body = await placeRes.text();
      throw new Error(`Place Details failed: ${placeRes.status} ${body}`);
    }

    const place = await placeRes.json();

    return new Response(JSON.stringify({
      geocode: best,      // includes formattedAddress, granularity, etc.
      place,              // enriched details
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message ?? "Unknown error" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
