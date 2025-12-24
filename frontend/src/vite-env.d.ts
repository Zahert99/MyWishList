declare module "react-lazy-with-preload" {
  import * as React from "react";

  export function lazyWithPreload<T extends React.ComponentType<any>>(
    factory: () => Promise<{ default: T }>
  ): React.LazyExoticComponent<T> & {
    preload: () => Promise<{ default: T }>;
  };
}
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
declare module "*.css";
