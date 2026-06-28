import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { Layers } from "lucide-react";
import type { District, PoliceStation } from "@/data/db";
import { karnatakaDistricts } from "@/data/geo/karnataka";
import { heatColor } from "@/lib/format";
import { MAP_LAYERS, DEFAULT_LAYERS } from "@/data/layers";


const hasGeometry = karnatakaDistricts.features.length > 0;

const STATE_CENTER: [number, number] = [14.7, 76.0];
const STATE_ZOOM = 7;

export interface HeatMapInnerProps {
  districts: District[];
  stations?: PoliceStation[];
  selectedId?: string;
  selectedStationId?: string;
  onSelect?: (d: District) => void;
  onSelectStation?: (s: PoliceStation) => void;
  height?: number | string;
}

/** Imperatively flies the map to the active scope (state / district / station). */
function MapController({
  districts,
  selectedId,
  station,
}: {
  districts: District[];
  selectedId?: string;
  station?: PoliceStation;
}) {
  const map = useMap();
  useEffect(() => {
    if (station) {
      map.flyTo([station.lat, station.lng], 12, { duration: 0.9 });
      return;
    }
    const d = districts.find((x) => x.id === selectedId);
    if (d) {
      map.flyTo([d.lat, d.lng], 10, { duration: 0.9 });
      return;
    }
    map.flyTo(STATE_CENTER, STATE_ZOOM, { duration: 0.9 });
  }, [map, districts, selectedId, station]);
  return null;
}

function stationIcon(selected: boolean) {
  const color = selected ? "#e6eaf0" : "#2dd4de";
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:3px;background:${color};border:2px solid #0b0d10;box-shadow:0 0 0 1px ${color}88"><div style="width:5px;height:5px;background:#0b0d10"></div></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

/** Translucent overlay control for toggling thematic map layers. */
function LayersControl({
  active,
  onToggle,
}: {
  active: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const stop = (el: HTMLDivElement | null) => {
    if (el) {
      L.DomEvent.disableClickPropagation(el);
      L.DomEvent.disableScrollPropagation(el);
    }
  };
  return (
    <div ref={stop} className="absolute right-2 top-2 z-[1000] font-mono">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-sm border border-border bg-panel/85 px-2.5 py-1.5 text-[11px] uppercase tracking-wide text-text-secondary backdrop-blur-md hover:text-text-primary"
      >
        <Layers className="h-3.5 w-3.5" />
        Layers
      </button>
      {open && (
        <div className="mt-1 w-52 rounded-sm border border-border bg-panel/90 p-1.5 backdrop-blur-md">
          {MAP_LAYERS.map((layer) => {
            const on = active.has(layer.id);
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => onToggle(layer.id)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[11px] text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border text-[9px] leading-none"
                  style={{
                    borderColor: layer.color,
                    background: on ? layer.color : "transparent",
                    color: on ? "#0b0d10" : "transparent",
                  }}
                >
                  ✓
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: layer.color }}
                />
                <span className={on ? "text-text-primary" : ""}>{layer.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}



/** Default-exported so it can be React.lazy()-loaded (client only). */
export default function HeatMapInner({
  districts,
  stations = [],
  selectedId,
  selectedStationId,
  onSelect,
  onSelectStation,
  height = "100%",
}: HeatMapInnerProps) {
  const heatByName = new Map(districts.map((d) => [d.name, d.crimeIndex]));
  const activeStation = stations.find((s) => s.id === selectedStationId);
  const showStations = !!selectedId && stations.length > 0;

  const [activeLayers, setActiveLayers] = useState<Set<string>>(
    () => new Set(DEFAULT_LAYERS),
  );
  const toggleLayer = (id: string) =>
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const hotspotsOn = activeLayers.has("hotspots");
  // Thematic (non-crime) layers currently enabled, rendered as translucent rings.
  const thematicLayers = MAP_LAYERS.filter(
    (l) => l.id !== "hotspots" && activeLayers.has(l.id),
  );

  return (
    <div className="relative" style={{ height, width: "100%" }}>
      <MapContainer
        center={STATE_CENTER}
        zoom={STATE_ZOOM}
        minZoom={6}
        maxZoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <MapController districts={districts} selectedId={selectedId} station={activeStation} />

        {hasGeometry && (
          <GeoJSON
            key={hotspotsOn ? "geo-heat" : "geo-base"}
            data={karnatakaDistricts}
            style={(f) => {
              const v = (f && heatByName.get(f.properties?.name)) ?? 0;
              return hotspotsOn
                ? { fillColor: heatColor(v), fillOpacity: 0.55, color: "#2f3744", weight: 1 }
                : { fillColor: "#161b22", fillOpacity: 0.35, color: "#2f3744", weight: 1 };
            }}
          />
        )}

        {/* Translucent thematic overlays — concentric rings, one hue per layer. */}
        {thematicLayers.map((layer, li) =>
          districts.map((d) => {
            const v = layer.value(d);
            const r = 10 + (v / 100) * 26 + li * 4;
            return (
              <CircleMarker
                key={`${layer.id}-${d.id}`}
                center={[d.lat, d.lng]}
                radius={r}
                interactive={false}
                pathOptions={{
                  color: layer.color,
                  weight: 1,
                  fillColor: layer.color,
                  fillOpacity: 0.08 + (v / 100) * 0.16,
                  opacity: 0.5,
                }}
              />
            );
          }),
        )}

        {districts.map((d) => {
          const selected = d.id === selectedId;
          const dimmed = !!selectedId && !selected;
          const r = 8 + (d.crimeIndex / 100) * 22;
          const baseColor = hotspotsOn ? heatColor(d.crimeIndex) : "#3a4250";
          return (
            <CircleMarker
              key={d.id}
              center={[d.lat, d.lng]}
              radius={hotspotsOn ? r : 7}
              pathOptions={{
                color: selected ? "#e6eaf0" : baseColor,
                weight: selected ? 2 : 1,
                fillColor: baseColor,
                fillOpacity: dimmed ? 0.12 : hotspotsOn ? 0.45 : 0.25,
                opacity: dimmed ? 0.3 : 1,
              }}
              eventHandlers={{ click: () => onSelect?.(d) }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <strong>{d.name}</strong>
                <br />
                Crime Index: {d.crimeIndex} · Active: {d.activeCases}
                {thematicLayers.map((layer) => (
                  <span key={layer.id}>
                    <br />
                    {layer.label}: {layer.value(d)}
                    {layer.unit === "%" ? "%" : ` ${layer.unit}`}
                  </span>
                ))}

                <br />
                {showStations ? "Click to view police stations" : "Overnight: "}
                {!showStations && (d.trend > 0 ? "+" : "")}
                {!showStations && `${d.trend}%`}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {showStations &&
          stations.map((s) => {
            const selected = s.id === selectedStationId;
            return (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={stationIcon(selected)}
                eventHandlers={{ click: () => onSelectStation?.(s) }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  <strong>{s.name}</strong>
                  <br />
                  Crime Index: {s.crimeIndex} · Active: {s.activeCases}
                  <br />
                  SHO: {s.officerInCharge}
                </Tooltip>
              </Marker>
            );
          })}
      </MapContainer>

      <LayersControl active={activeLayers} onToggle={toggleLayer} />
    </div>
  );
}

