import React, { useEffect } from 'react';

declare global {
  interface Window {
    Mazemap: any;
  }
}

interface CoordinatesObject {
  lng: number;
  lat: number;
}

type Coordinates = [number, number];

export interface MazeMapUserOptions {
  campuses: number;
  center?: CoordinatesObject | Coordinates;
  zoom?: number;
  maxBounds?: CoordinatesPair;
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

interface LineProp {
  colour?: string;
  width?: number;
  coordinates: CoordinatesPair;
}

interface PoiLocation {
  coordinates: Coordinates | CoordinatesObject;
  zLevel: number;
}

interface Poi {
  // A subset of the POI type returned by MazeMap
  coordinates: CoordinatesObject;
  geometry: string;
  zLevel: number;
}

interface HighlighterProp {
  fill: boolean;
  outline: boolean;
  colour?: string;
  outlineColour?: string;
  poiOnLoad?: PoiLocation;
}

export interface MazeMapProps extends MazeMapUserOptions {
  [key: string]: any;
  width: string;
  height: string;
  controls?: boolean;
  hideWatermark?: boolean;
  marker?: MarkerProp;
  onMapClick?: (coordinates: Coordinates, zLevel: number) => void;
  line?: LineProp;
  highlighter?: HighlighterProp;
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
  lngLat: CoordinatesObject;
  originalEvent: MouseEvent;
  target: any; // very complicated definition
  type: string;
}

type CoordinatesPair = [
  Coordinates | CoordinatesObject,
  Coordinates | CoordinatesObject
];

const getCoordinates = (
  coordinates: Coordinates | CoordinatesObject
): CoordinatesObject => {
  if (Array.isArray(coordinates)) {
    return {
      lng: coordinates[0],
      lat: coordinates[1],
    };
  }
  return coordinates;
};

const MazeMap = (props: MazeMapProps) => {
  let highlighter: any;
  let marker: any;

  const userOptions: MazeMapUserOptions = {
    campuses: props.campuses,
    ...(props.center && { center: getCoordinates(props.center) }),
    ...(props.zoom && { zoom: props.zoom }),
    ...(props.maxBounds && {
      maxBounds: props.maxBounds.map(getCoordinates) as CoordinatesPair,
    }),
  };

  const mapOptions: MazeMapOptions = {
    container: 'map',
    ...userOptions,
  };

  const clearMarker = () => {
    if (marker) {
      marker.remove();
    }
  };

  const clearHighlighter = () => {
    if (highlighter) {
      highlighter.clear();
    }
  };

  const getProp = (prop: string, key: string, defaultValue: any) => {
    if (!props[prop]) return defaultValue;
    return props[prop][key] || defaultValue;
  };

  const drawMarker = (
    map: any,
    coordinates: CoordinatesObject,
    zLevel: number
  ) => {
    if (window.Mazemap) {
      const colour = getProp('marker', 'colour', '#ff00cc');
      const innerColour = getProp('marker', 'innerColour', '#ffffff');
      const size = getProp('marker', 'size', 34);

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
    if (!props.highlighter) return;
    const outline = props.highlighter.outline;
    const fill = props.highlighter.fill;
    const outlineColour = getProp(
      'highlighter',
      'outlineColour',
      window.Mazemap.Util.Colors.MazeColors.MazeBlue
    );
    const colour = getProp(
      'highlighter',
      'colour',
      window.Mazemap.Util.Colors.MazeColors.MazeBlue
    );

    if (window.Mazemap) {
      highlighter = new window.Mazemap.Highlighter(map, {
        showOutline: outline,
        showFill: fill,
        outlineColor: outlineColour,
        fillColor: colour,
      });
    }
  };

  const highlightPoi = (poi: any) => {
    if (!highlighter) return;
    // TODO: figure out the type of POI here
    // or at least, what data is needed
    // so i can put it in the POI type
    highlighter.highlight(poi);
  };

  const getPoiAt = (
    coordinates: CoordinatesObject,
    zLevel: number
  ): Poi | null => {
    if (window.Mazemap) {
      window.Mazemap.Data.getPoiAt(coordinates, zLevel).then((poi: any) => {
        if (!poi) return null;
        const poiCoordinates: CoordinatesObject =
          window.Mazemap.Util.getPoiLngLat(poi);
        const poiZLevel = poi.properties.zLevel;
        const geometry = poi.geometry.type;
        return {
          coordinates: poiCoordinates,
          zLevel: poiZLevel,
          geometry,
        };
      });
    }
    return null;
  };

  const addMarker = (map: any, e: MapClick, marker: MarkerProp) => {
    let coordinates = e.lngLat;
    let zLevel = map.zLevel;

    clearMarker();
    clearHighlighter();

    if (window.Mazemap) {
      const poi = getPoiAt(coordinates, zLevel);
      if (!poi) {
        drawMarker(map, coordinates, zLevel);
        return;
      }
      if (poi.geometry === 'Polygon' && marker.type === MarkerType.POIMarker) {
        highlightPoi(poi);
        map.flyTo({
          center: poi.coordinates,
          zoom: 19,
          speed: 0.5,
        });
      }
      drawMarker(map, getCoordinates(poi.coordinates), poi.zLevel);
    }
  };

  const addLine = (
    map: any,
    colour: string,
    width: number,
    coordinates: [CoordinatesObject, CoordinatesObject]
  ) => {
    if (window.Mazemap) {
      map.addLayer({
        id: 'line1',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [coordinates[0].lng, coordinates[0].lat],
                [coordinates[1].lng, coordinates[1].lat],
              ],
            },
          },
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': colour,
          'line-width': width,
        },
      });
    }
  };

  const showPoiOnLoad = (poiOnLoad: PoiLocation) => {
    const poiCoordinates: CoordinatesObject = getCoordinates(
      poiOnLoad.coordinates
    );
    const poi = getPoiAt(poiCoordinates, poiOnLoad.zLevel);
  };

  const prepareMap = () => {
    if (window.Mazemap) {
      const map = new window.Mazemap.Map(mapOptions);
      map.on('load', () => {
        if (props.controls) {
          map.addControl(new window.Mazemap.mapboxgl.NavigationControl());
        }

        if (props.highlighter) {
          initialiseHighlighter(map);
          if (props.highlighter.poiOnLoad) {
            showPoiOnLoad(props.highlighter.poiOnLoad);
          }
        }
        if (props.marker) {
          map.on('click', (e: MapClick) => {
            addMarker(map, e, props.marker as MarkerProp);
          });
        }

        if (props.line) {
          const colour = getProp('line', 'colour', '#ff00cc');
          const width = getProp('line', 'width', 3);
          const coordinates = props.line.coordinates.map(getCoordinates);
          addLine(
            map,
            colour,
            width,
            coordinates as [CoordinatesObject, CoordinatesObject]
          );
        }

        map.on('click', (e: MapClick) => {
          if (!props.onMapClick) return;
          props.onMapClick([e.lngLat.lng, e.lngLat.lat], map.zLevel);
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
