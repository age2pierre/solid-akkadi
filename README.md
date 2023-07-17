[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/age2pierre/solid-akkadi?file=src%2Fmain.tsx)

# solid-akkadi

A simple integration of BabylonJS and Rapier with SolidJS.

Goals :
* Provide basic building block to make simple web game using fine grained reactivity.
* Have a good DX by providing good type coverage.

Non-goals :
* cover every aspect of BabylonJS and Rapier
* publish it on npm (for now)

For similar solutions more mature look at :
* [https://docs.pmnd.rs/react-three-fiber]()
* [https://brianzinn.github.io/react-babylonjs/]()

## Getting started

```
pnpm i
pnpm run dev
```

Open browser to `http://localhost:5173/solid-akkadi/`

## Dependencies

Use only `pnpm`.

Use exact version in package.json.

To review dependencies run `pnpm update --latest --interactive` or `pnpm update -L -i`

To view bundle size run `pnpm run bundle-viz`.

## Assets credits

- `src/assets/Vulpes_modules.glb` original by me (age2pierre)
- `src/assets/Crate.glb` by [Quaternius](https://quaternius.com/) CC0 from [https://poly.pizza/m/3VGWnZPXmG]()
- `src/assets/Animated_Robot.glb` by [Quaternius](https://quaternius.com/) CC0 from [https://poly.pizza/m/QCm7qe9uNJ]()
