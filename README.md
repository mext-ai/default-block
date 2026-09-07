# Webpack Block Template

This is a standardized template for creating Module Federation blocks in the MEXT system.

## Features

- 🔧 **Webpack 5** with Module Federation
- ⚛️ **React 19** with TypeScript
- 🎨 **CSS Loader** support
- 🔥 **Hot Module Replacement** for development
- 📦 **Shared React singleton** - one React per page, everything else bundled per block

## Structure

```
src/
├── index.tsx     # Entry point for development
├── App.tsx       # Main component (exported as ./Block)
└── ...          # Your custom components
```

## Development

```bash
npm install
npm run dev      # Start development server on port 3001
```

## Build for Production

```bash
npm run build    # Creates dist/ with remoteEntry.js
```

## Module Federation

The platform never executes this repository's `webpack.config.js`: when a block is
built, the backend renders its own config from the block's **build profile** and
the file here only mirrors that contract for local builds. The contract is:

- container name `block_<blockId>` (also the webpack `uniqueName`), unique per block
- `./Block` → `./src/App` — `mount(container, props)`, the API every Mexty host calls
- `./Component` → `./src/block` — the `Block` component itself, for hosts that share React
- `react` and `react-dom` shared as eager singletons; every other dependency is bundled

The profile comes from `package.json`:

```json
"mexty": { "profile": "default" }
```

`default` is what every block gets. Engine blocks (game hosts, primitives) set
`"engine"`, which additionally shares the 3D stack and exposes `./Primitive`.

## Usage as Federation Module

```javascript
// Any host: load remoteEntry, then mount
const { mount } = (await window.block_<id>.get('./Block'))();
const api = mount(element, props); // api.updateProps(next), api.unmount()

// A host that shares React 19 (after container.init(shareScope)):
const { Block } = (await window.block_<id>.get('./Component'))();
<Block {...props} />
```

## Customization

1. Replace `src/App.tsx` with your custom component
2. Add dependencies to `package.json`
3. The backend will automatically use this template and inject your files

## Important Notes

- The container `name` in `webpack.config.js` is replaced by the backend with `block_<blockId>`
- Only `react` and `react-dom` are shared; every other dependency is bundled with the block
- CORS headers are configured for federation module loading 
