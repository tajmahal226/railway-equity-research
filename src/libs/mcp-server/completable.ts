import {
  ZodTypeAny,
  ZodType,
  ZodErrorMap,
} from 'zod';

/**
 * Zod 4.x compatibility: Completable was designed to extend ZodType
 * but internal Zod types changed significantly in v4.x.
 * Since this class is never instantiated in the codebase (only imported for types),
 * we provide minimal type stubs here for TypeScript compatibility.
 */

export type CompleteCallback<T extends ZodTypeAny = ZodTypeAny> = (
  value: T["_input"]
) => T["_input"][] | Promise<T["_input"][]>;

export enum McpZodTypeKind {
  Completable = "McpCompletable",
}

// Minimal type stub - not usable for runtime but satisfies TypeScript
export interface CompletableDef<T extends ZodTypeAny = ZodTypeAny> {
  type: T;
  complete: CompleteCallback<T>;
  typeName: McpZodTypeKind.Completable;
}

// Stub class - throws error if actually instantiated (should never happen)
export class Completable<T extends ZodTypeAny> {
  constructor(def: CompletableDef<T>) {
    throw new Error(
      "Completable class is not compatible with Zod 4.x. " +
      "This class should not be instantiated directly."
    );
  }

  unwrap() {
    throw new Error("Completable.unwrap() not implemented for Zod 4.x");
  }

  static create = <T extends ZodTypeAny>(
    _type: T,
    _params: { complete: CompleteCallback<T> }
  ): Completable<T> => {
    throw new Error("Completable.create() not implemented for Zod 4.x");
  };
}

export function completable<T extends ZodTypeAny>(
  _schema: T,
  _complete: CompleteCallback<T>
): Completable<T> {
  throw new Error("completable() function not implemented for Zod 4.x");
}
