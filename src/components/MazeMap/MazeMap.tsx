import React, { useEffect } from 'react';

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
  maxBounds?: Bounds;
}

export enum MarkerType {
  Marker = 1,
  POIMarker = 2,
}

export interface MarkerProp {
  [key: string]: any;
  type: MarkerType;
  colour?: string;
  innerColour?: string;
  size?: number;
}

export interface MazeMapProps extends MazeMapUserOptions {
  width: string;
  height: string;
  controls?: boolean;
  hideWatermark?: boolean;
  marker?: MarkerProp;
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

type Bounds = [[number, number], [number, number]];

const MazeMap = (props: MazeMapProps) => {
  let highlighter: any;
  let marker: any;

  const userOptions: MazeMapUserOptions = {
    campuses: props.campuses,
    ...(props.center && { center: props.center }),
    ...(props.zoom && { zoom: props.zoom }),
    ...(props.maxBounds && { maxBounds: props.maxBounds }),
  };

  const mapOptions: MazeMapOptions = {
    container: 'map',
    ...userOptions,
  };

  const clearMarker = (map: any) => {
    if (marker) {
      marker.remove();
    }
    highlighter.clear();
  };

  const getFromMarker = (key: string, defaultValue: any) => {
    if (!props.marker) return defaultValue;
    return props.marker[key] || defaultValue;
  };

  const drawMarker = (map: any, coordinates: Coordinates, zLevel: number) => {
    if (window.Mazemap) {
      const colour = getFromMarker('colour', '#ff00cc');
      const innerColour = getFromMarker('innerColour', '#ffffff');
      const size = getFromMarker('size', 34);

      marker = new window.Mazemap.MazeMarker({
        color: colour,
        innerCircle: true,
        innerCircleColor: innerColour,
        size,
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

  const addMarker = (map: any, e: MapClick, marker: MarkerProp) => {
    let coordinates = e.lngLat;
    let zLevel = map.zLevel;

    clearMarker(map);

    if (window.Mazemap) {
      window.Mazemap.Data.getPoiAt(coordinates, zLevel).then((poi: any) => {
        coordinates = window.Mazemap.Util.getPoiLngLat(poi);
        zLevel = poi.properties.zLevel;
        if (
          poi.geometry.type === 'Polygon' &&
          marker.type === MarkerType.POIMarker
        ) {
          highlighter.highlight(poi);
          map.flyTo({
            center: coordinates,
            zoom: 19,
            speed: 0.5,
          });
        }
      });

      drawMarker(map, coordinates, zLevel);
    }
  };

  const prepareMap = () => {
    if (window.Mazemap) {
      const map = new window.Mazemap.Map(mapOptions);
      map.on('load', () => {
        if (props.controls) {
          map.addControl(new window.Mazemap.mapboxgl.NavigationControl());
        }

        if (props.marker) {
          initialiseHighlighter(map);
          map.on('click', (e: MapClick) => {
            addMarker(map, e, props.marker as MarkerProp);
          });
        }
        map.on('click', (e: MapClick) => {
          if (!props.onMapClick) return;
          props.onMapClick(e.lngLat, map.zLevel);
        });
      });
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api.mazemap.com/js/v2.1.2/mazemap.min.js';
    document.body.appendChild(script);

    const map = document.getElementById('map');
    if (map) {
      map.classList.add('mazemap');
    }

    script.onload = () => {
      prepareMap();
    };
    script.onerror = (e) => {
      console.error('mazemap-react: mazemap script failed to load');
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

export { MazeMap, MarkerType as Marker };
