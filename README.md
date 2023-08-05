[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/age2pierre/solid-akkadi?file=src%2Fmain.tsx)

# solid-akkadi

A simple integration of BabylonJS and Rapier with SolidJS.

Goals :
* Provide basic components to make simple 3d scenes using fine grained reactivity.
* Have a good DX by providing good type coverage.

Non-goals :
* Cover every features of BabylonJS and Rapier.

For more mature & similar solutions look at :
* [https://docs.pmnd.rs/react-three-fiber]()
* [https://brianzinn.github.io/react-babylonjs/]()
* [https://github.com/solidjs-community/solid-three/]()

## Getting started

```
pnpm i
pnpm run build
pnpm run dev
```

Open browser to `http://localhost:5173/solid-akkadi/` see the demo app running

## Dependencies

Use only `pnpm`.
Use exact version in every package.json.
To review dependencies run `pnpm update -L -i -r`.

## Assets credits

* `demo-app/public/assets/Animated_Robot.glb` by [Quaternius](https://quaternius.com/) CC0 from [https://poly.pizza/m/QCm7qe9uNJ]()
* `demo-app/public/assets/arena.glb` original by me (age2pierre)
* `demo-app/public/assets/Crate.glb` by [Quaternius](https://quaternius.com/) CC0 from [https://poly.pizza/m/3VGWnZPXmG]()
* `demo-app/public/assets/Vulpes_modules.glb` original

## Todos

* Features
  - [ ] Particle component
  - [ ] MaterialNode component
  - [ ] Optimize bundle size (use ESM for BJS)
* Chores
  - [ ] GH actions for publish workflow
  - [ ] Split linter for lib / apps / scripts
* Documentation
  - [ ] Add TS doc to a maximum of exported members
  - [ ] Generate API doc with typedoc
  - [ ] Write a "Getting started" guide
  - [ ] Write a "Writing your own component" guide
