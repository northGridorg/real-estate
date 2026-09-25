/** Browser-only loader for the Google Maps JavaScript API. */
let loadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    google?: any;
    __ngMapsReady?: () => void;
  }
}

export const GOOGLE_MAPS_BROWSER_KEY = import.meta.env
  .VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;

const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as
  | string
  | undefined;

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.maps?.Map) {
      resolve();
      return;
    }
    if (!GOOGLE_MAPS_BROWSER_KEY) {
      reject(new Error("Google Maps browser key is not configured."));
      return;
    }

    window.__ngMapsReady = () => resolve();

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_BROWSER_KEY,
      loading: "async",
      callback: "__ngMapsReady",
    });
    if (TRACKING_ID) params.set("channel", TRACKING_ID);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps."));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Dark wealth-desk styling for the Maps JS API (classic style array). */
export const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#10b981" }],
  },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#111c31" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#243549" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#132036" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#08111f" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#334e68" }] },
] as const;