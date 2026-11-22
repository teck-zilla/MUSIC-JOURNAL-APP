import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const asArray = (config) => (Array.isArray(config) ? config : [config]);

const config = [
  ...asArray(nextVitals),
  ...asArray(nextTs),
  {
    ignores: ['.next/**', 'node_modules/**', 'ndocs/**', 'js/**', 'index.html'],
  },
];

export default config;
