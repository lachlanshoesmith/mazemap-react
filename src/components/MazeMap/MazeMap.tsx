import React, { useEffect } from "react";

declare global {
  interface Window {
    Mazemap: any;
  }
}

interface Coordinates {
  lng: number;
  lat: number;
}

export interface MazeMapUserOptions {
  campuses: number;
  center?: Coordinates;
  zoom?: number;
}

enum MarkerProp {
  Marker = 1,
  POIMarker = 2,
}

export interface MazeMapProps extends MazeMapUserOptions {
  width: string;
  height: string;
  controls?: boolean;
  hideWatermark?: boolean;
  marker?: MarkerProp;
  hideIcons?: boolean;
  hideAll?: boolean;
  onMapClick?: (coordinates: Coordinates, zLevel: number) => void;
}

export interface MazeMapOptions extends MazeMapUserOptions {
  container: string;
}

interface XY {
  x: number;
  y: number;
}

interface MapClick {
  _defaultPrevented: boolean;
  point: XY;
  lngLat: Coordinates;
  originalEvent: MouseEvent;
  target: any; // very complicated definition
  type: string;
}

const MazeMap = (props: MazeMapProps) => {
  let highlighter: any;
  let marker: any;

  const userOptions: MazeMapUserOptions = {
    campuses: props.campuses,
    ...(props.center && { center: props.center }),
    ...(props.zoom && { zoom: props.zoom }),
  };

  const mapOptions: MazeMapOptions = {
    container: "map",
    ...userOptions,
  };

  const clearMarker = (map: any) => {
    if (marker) {
      marker.remove();
    }
    highlighter.clear();
  };

  const drawMarker = (map: any, coordinates: Coordinates, zLevel: number) => {
    if (window.Mazemap) {
      marker = new window.Mazemap.MazeMarker({
        color: "#ff00cc",
        innerCircle: true,
        innerCircleColor: "#ffffff",
        size: 34,
        innerCircleScale: 0.5,
        zlevel: zLevel,
      })
        .setLngLat(coordinates)
        .addTo(map);
    }
  };

  const initialiseHighlighter = (map: any) => {
    if (window.Mazemap) {
      highlighter = new window.Mazemap.Highlighter(map, {
        showOutline: true,
        showFill: true,
        outlineColor: window.Mazemap.Util.Colors.MazeColors.MazeBlue,
        fillColor: window.Mazemap.Util.Colors.MazeColors.MazeBlue,
      });
    }
  };

  const addMarker = (map: any, e: MapClick, markerType: MarkerProp) => {
    let coordinates = e.lngLat;
    let zLevel = map.zLevel;

    clearMarker(map);

    if (window.Mazemap) {
      window.Mazemap.Data.getPoiAt(coordinates, zLevel).then((poi: any) => {
        coordinates = window.Mazemap.Util.getPoiLngLat(poi);
        zLevel = poi.properties.zLevel;
        if (
          poi.geometry.type === "Polygon" &&
          markerType === MarkerProp.POIMarker
        ) {
          highlighter.highlight(poi);
          map.flyTo({
            center: coordinates,
            zoom: 19,
            speed: 0.5,
          });
        }
      });

      if (props.onMapClick) {
        props.onMapClick(coordinates, zLevel);
      }

      drawMarker(map, coordinates, zLevel);
    }
  };

  const prepareMap = () => {
    if (window.Mazemap) {
      const map = new window.Mazemap.Map(mapOptions);
      map.on("load", () => {
        if (props.controls) {
          map.addControl(new window.Mazemap.mapboxgl.NavigationControl());
        }
        if (props.hideIcons && (!props.hideAll)) {
          let style = map.getStyle();

          // layer 143 room icons
          let layer143 = style.layers[143];
          // layer144 building icons
          let layer144 = style.layers[144];

          layer143.layout = {
            "text-field": "{text}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-padding": 7,
            "text-size": {
              base: 1,
              stops: [
                [17, 10],
                [20, 16],
                [20.9, 22],
              ],
            },
            "text-anchor": "center",
          };

          layer144.layout = {
            "text-field": "{text}",
            "text-allow-overlap": false,
            "symbol-avoid-edges": false,
            "text-size": {
              base: 1,
              stops: [
                [13, 10],
                [16, 12],
                [17, 14],
                [20, 20],
              ],
            },
            "text-font": {
              base: 1,
              stops: [
                [10, ["Open Sans Regular"]],
                [17, ["Open Sans Bold"]],
              ],
            },
            "text-letter-spacing": 0.05,
            "text-padding": 10.75,
          };
          map.setStyle(style);
        }
        if (props.hideAll) {
          let style = map.getStyle();
          style.layers = style.layers.filter((layer: any) => {
            if (layer.type) {
              return layer.type !== "symbol";
            }
          });
          map.setStyle(style);
        }
        if (props.marker) {
          initialiseHighlighter(map);
          map.on("click", (e: MapClick) => {
            addMarker(map, e, props.marker as MarkerProp);
          });
        }
        map.on("click", (e: MapClick) => {
          if (!props.onMapClick) return;
          props.onMapClick(e.lngLat, map.zLevel);
        });
      });
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://api.mazemap.com/js/v2.1.2/mazemap.min.js";
    document.body.appendChild(script);

    const map = document.getElementById("map");
    if (map) {
      map.classList.add("mazemap");
    }

    script.onload = () => {
      prepareMap();
    };
    script.onerror = (e) => {
      console.error("mazemap-react: mazemap script failed to load");
      console.error(e);
    };
  }, []);
  return (
    <>
      <link
        rel="stylesheet"
        href="https://api.mazemap.com/js/v2.1.2/mazemap.min.css"
      />
      <div id="map" style={{ width: props.width, height: props.height }}></div>
      {props.hideWatermark && (
        <style>
          {`
        div.mazemap-ctrl-logo-wrapper .mazemap-ctrl-logo,
        a.mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-attrib.mapboxgl-compact .mapboxgl-ctrl-attrib-button,
        .mapboxgl-ctrl-attrib.mapboxgl-compact-show .mapboxgl-ctrl-attrib-inner,
        .mapboxgl-ctrl.mapboxgl-ctrl-attrib.mm-attribution-control-override {
          display: none;
        }
        `}
        </style>
      )}
    </>
  );
};

export { MazeMap, MarkerProp as Marker };
