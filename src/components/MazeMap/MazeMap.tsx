import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Mazemap: any;
  }
}

export interface MazeMapProps {
  label: string;
}

const MazeMap = (props: MazeMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api.mazemap.com/js/v2.1.2/mazemap.min.js';
    document.body.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://api.mazemap.com/js/v2.1.2/mazemap.min.css';
    document.body.appendChild(link);

    script.onload = () => {
      if (window.Mazemap && mapRef.current?.innerHTML === '') {
        const map = new window.Mazemap.Map({ container: 'map' });
      }
    };
  }, []);
  return (
    <div ref={mapRef} id="map" style={{ width: '100%', height: '100%' }}></div>
  );
};

export default MazeMap;
