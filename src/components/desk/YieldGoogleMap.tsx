import { useEffect, useRef, useState } from "react";

import { COMMUNITIES, communityById, type Asset } from "@/data/desk";
import { DARK_MAP_STYLES, loadGoogleMaps } from "@/lib/google-maps";
import { bpsToPercent, formatAedCompact, formatBps } from "@/lib/money";

/** Deterministic spread of assets around their community centroid. */
export function assetLatLng(asset: Asset) {
  const c = communityById(asset.communityId);
  const lat = c?.lat ?? 25.2048;
  const lng = c?.lng ?? 55.2708;
  return {
    lat: lat + ((asset.y % 10) - 5) * 0.0022,
    lng: lng + ((asset.x % 10) - 5) * 0.0026,
  };
}

interface Props {
  assets: Asset[];
  matchIds: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  satellite: boolean;
  heat: boolean;
}

export default function YieldGoogleMap({
  assets,
  matchIds,
  selectedId,
  onSelect,
  satellite,
  heat,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const circlesRef = useRef<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !hostRef.current || mapRef.current) return;
        const g = window.google;
        mapRef.current = new g.maps.Map(hostRef.current, {
          center: { lat: 25.145, lng: 55.21 },
          zoom: 11,
          styles: DARK_MAP_STYLES as unknown as any[],
          mapTypeId: satellite ? "hybrid" : "roadmap",
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          backgroundColor: "#0f172a",
        });
        setReady(true);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map type toggle
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.setMapTypeId(satellite ? "hybrid" : "roadmap");
  }, [ready, satellite]);

  // Growth heat overlay per community
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const g = window.google;
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];
    if (!heat) return;
    COMMUNITIES.forEach((c) => {
      const intensity = Math.min(1, bpsToPercent(c.growth1yBps) / 20);
      circlesRef.current.push(
        new g.maps.Circle({
          map: mapRef.current,
          center: { lat: c.lat, lng: c.lng },
          radius: 900 + intensity * 2600,
          strokeColor: "#10b981",
          strokeOpacity: 0.45,
          strokeWeight: 1,
          fillColor: "#10b981",
          fillOpacity: 0.06 + intensity * 0.18,
          clickable: false,
        }),
      );
    });
  }, [ready, heat]);

  // Markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const g = window.google;

    const icon = (state: "selected" | "match" | "dim") => ({
      path: g.maps.SymbolPath.CIRCLE,
      scale: state === "selected" ? 11 : state === "match" ? 8 : 6,
      fillColor: state === "dim" ? "#475569" : "#10b981",
      fillOpacity: state === "dim" ? 0.55 : 1,
      strokeColor: state === "selected" ? "#ffffff" : "#0f172a",
      strokeWeight: 2,
    });

    assets.forEach((a) => {
      const state = a.id === selectedId ? "selected" : matchIds.has(a.id) ? "match" : "dim";
      const existing = markersRef.current.get(a.id);
      const label = {
        text: `${formatAedCompact(a.price)} · +${formatBps(a.annualGrowthBps)}`,
        color: state === "dim" ? "#94a3b8" : "#e2e8f0",
        fontSize: "11px",
        fontWeight: "700",
        className: "",
      };
      if (existing) {
        existing.setIcon(icon(state));
        existing.setZIndex(state === "selected" ? 30 : state === "match" ? 20 : 10);
        return;
      }
      const marker = new g.maps.Marker({
        map: mapRef.current,
        position: assetLatLng(a),
        icon: icon(state),
        title: `${a.title} — ${formatAedCompact(a.price)}`,
        label,
        zIndex: 20,
      });
      marker.addListener("click", () => onSelect(a.id));
      markersRef.current.set(a.id, marker);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, assets, matchIds, selectedId]);

  // Pan to selection
  useEffect(() => {
    if (!ready || !mapRef.current || !selectedId) return;
    const asset = assets.find((a) => a.id === selectedId);
    if (asset) mapRef.current.panTo(assetLatLng(asset));
  }, [ready, selectedId, assets]);

  return (
    <>
      <div ref={hostRef} className="absolute inset-0 h-full w-full" />
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
          {error ?? "Loading Dubai satellite layer…"}
        </div>
      ) : null}
    </>
  );
}