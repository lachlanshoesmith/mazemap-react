import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Mazemap: any;
  }
}

export interface MazeMapUserOptions {
  campuses: number;
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
}

export interface MazeMapProps extends MazeMapUserOptions {
  width: string;
  height: string;
  controls?: boolean;
  hideWatermark?: boolean;
}

export interface MazeMapOptions extends MazeMapUserOptions {
  container: string;
}

const MazeMap = (props: MazeMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const userOptions: MazeMapUserOptions = {
    campuses: props.campuses,
    ...(props.center && { center: props.center }),
    ...(props.zoom && { zoom: props.zoom }),
  };

  const mapOptions: MazeMapOptions = {
    container: 'map',
    ...userOptions,
  };

  const prepareMap = () => {
    if (window.Mazemap && mapRef.current?.innerHTML === '') {
      const map = new window.Mazemap.Map(mapOptions);
      if (props.controls) {
        map.addControl(new window.Mazemap.mapboxgl.NavigationControl());
      }
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
