# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Notes on Tailwind CSS

- Tailwind v4 uses a single CSS import. In `src/index.css` we only include:
	- `@import "tailwindcss";`
- The legacy `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;` directives are for Tailwind v3 and are not needed in v4.
- Customization is optional. If you want custom theme tokens, utilities, or plugins, you can add/edit `tailwind.config.ts`. This project includes a minimal example with a `brand` color.
