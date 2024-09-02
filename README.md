# mazemap-react

[mazemap](https://api.mazemap.com/js/v2.1.2/docs/) but as a react component featuring types

![1.0.4](https://img.shields.io/npm/v/@lachlanshoesmith/mazemap-react)

## example usage

```tsx
<MazeMap
  campuses={123}
  center={{ lng: 123, lat: -123 }}
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
  onMapClick={(coordinates, zLevel) => ...}
  maxBounds={
    [[151.217893555, -33.9242064802],
    [151.244924424,-33.9126716815]]
  }
/>
```

## installation

`npm install @lachlanshoesmith/mazemap-react`

## building

`npm run build` generates both an esm and cjs export in `dist/`.

## credits

not affiliated with the mazemap project whatsoever. but shoutout to them.
