import React, { useEffect, useRef } from 'react';

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
  const mapRef = useRef<HTMLDivElement>(null);
  let highlighter: any;
  let marker: any;

  const userOptions: MazeMapUserOptions = {
    campuses: props.campuses,
    ...(props.center && { center: props.center }),
    ...(props.zoom && { zoom: props.zoom }),
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

  const drawMarker = (map: any, coordinates: Coordinates, zLevel: number) => {
    if (window.Mazemap) {
      marker = new window.Mazemap.MazeMarker({
        color: '#ff00cc',
        innerCircle: true,
        innerCircleColor: '#ffffff',
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
        if (poi.geometry.type === 'Polygon') {
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
    if (window.Mazemap && mapRef.current?.innerHTML === '') {
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
      });
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api.mazemap.com/js/v2.1.2/mazemap.min.js';
    document.body.appendChild(script);

    mapRef.current?.classList.add('mazemap');

    script.onload = () => {
      prepareMap();
    };
  }, []);
  return (
    <>
      <link
        rel="stylesheet"
        href="https://api.mazemap.com/js/v2.1.2/mazemap.min.css"
      />
      <div
        ref={mapRef}
        id="map"
        style={{ width: props.width, height: props.height }}
      ></div>
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

export default MazeMap;
