# mazemap-react

[mazemap](https://api.mazemap.com/js/v2.1.2/docs/) but as a react component featuring types

![1.0.19](https://img.shields.io/npm/v/@lachlanshoesmith/mazemap-react) | [npm](https://www.npmjs.com/package/@lachlanshoesmith/mazemap-react)

## example usage

```tsx
<MazeMap
  campuses={123}
  center={{ lng: 123, lat: -123 }}
  center={[123, -123]} // this also works - take your pick!
  zoom={3}
  width={'500px'}
  height={'30vh'}
  hideWatermark={false}
  marker={{
    // marker that locks on to and highlights POI if one is clicked on
    // MarkerType.Marker does not do this and just draws a marker exactly
    // where the user clicked
    type: MarkerType.POIMarker,
    colour: '#ff0000',
    innerColour: '#0000ff',
    size: 32
  }}
  // coordinates passed to onMapClick will be in the tuple [] format
  onMapClick={(coordinates, zLevel) => ...}
  maxBounds={
    // again, you can use either syntax:
    [[151.217893555, -33.9242064802],
    { lng: 151.244924424, lat: -33.9126716815 }]
  }
  line={{
    colour: '#ff0000',
    coordinates: [
      [151.217893555, -33.9242064802],
      [151.244924424, -33.9126716815]
    ],
    width: 3
  }},
  highlight={{
    fill: true,
    outline: true,
    colour: '#ff0000',
    outlineColour: '#00ffff',
    poiOnLoad: {
      // highlight a POI at the given coordinates
      // when the map is mounted
      // as usual, you can enter the coordinates in either
      // the {lng: lat: } format or as a tuple
      coordinates: [151.244924424, -33.9126716815],
      zLevel: 0
    }
  }}
/>
```

## installation

`npm install @lachlanshoesmith/mazemap-react`

## building

`npm run build` generates both an esm and cjs export in `dist/`.

## credits

not affiliated with the mazemap project whatsoever. but shoutout to them.
