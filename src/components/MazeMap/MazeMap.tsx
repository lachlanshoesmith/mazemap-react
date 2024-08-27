import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    MazeMap: any;
  }
}

export interface MazeMapProps {
  label: string;
}

const addNewMap = (MazeMap: any) => {
  console.log(MazeMap);
  const map = new MazeMap.map({ container: 'mazemap-container' });
};

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
      if (window.MazeMap) {
        addNewMap(window.MazeMap);
      } else {
        console.error('mazemap-react: MazeMap is not defined on the window');
      }
    };
  }, []);
  return (
    <div ref={mapRef} id="map" style={{ width: '100%', height: '100%' }}></div>
  );
};

export default MazeMap;
