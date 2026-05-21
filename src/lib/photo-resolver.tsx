"use client";

import { createContext, useContext } from "react";
import { StorageAdapter } from "./storage/adapter";

export type ResolveFn = (photoId: string) => Promise<string>;

export interface Resolver {
  resolve(photoId: string): Promise<string>;
}

export class LocalResolver implements Resolver {
  constructor(private adapter: StorageAdapter) {}

  async resolve(photoId: string): Promise<string> {
    return this.adapter.getBlobURL(`photo:${photoId}`);
  }
}

const PhotoResolverContext = createContext<Resolver | null>(null);

export const PhotoResolver = {
  Provider: PhotoResolverContext.Provider,
} as const;

export function usePhotoResolver(): ResolveFn {
  const ctx = useContext(PhotoResolverContext);
  if (!ctx) {
    throw new Error("usePhotoResolver must be used within a PhotoResolver.Provider");
  }
  return (photoId: string) => ctx.resolve(photoId);
}
