# mazemap-react

[mazemap](https://api.mazemap.com/js/v2.1.2/docs/) but as a react component featuring types

## example usage

```tsx
<MazeMap
  campuses={123}
  center={{ lng: 123, lat: -123 }}
  zoom={3}
  width={'500px'}
  height={'30vh'}
  hideWatermark={false}
  marker={1} // 1 = regular marker,
	     // 2 = marker that locks on to and highlights POI if one is clicked on
  onMapClick={(coordinates, zLevel) => ...}
  // more props can be seen in
  // the MazeMapUserOptions interface
/>
```

## installation

`npm install @lachlanshoesmith/mazemap-react`

## building

`npm run build` generates both an esm and cjs export in `dist/`.

## credits

not affiliated with the mazemap project whatsoever. but shoutout to them.
