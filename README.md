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
  marker={1}
  onMapClick={(coordinates, zLevel) => ...}
  // more props can be seen in
  // the MazeMapUserOptions interface
/>
```

## building

`npm run build` generates both an esm and cjs export in `dist/`.

## credits

not affiliated with the mazemap project whatsoever. but shoutout to them.
