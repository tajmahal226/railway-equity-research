import {
  ZodTypeAny,
  ZodType,
  ZodTypeDef,
  ParseInput,
  ParseReturnType,
} from 'zod';

export type CompleteCallback<T extends ZodTypeAny = ZodTypeAny> = (
  value: T["_input"]
) => T["_input"][] | Promise<T["_input"][]>;

export enum McpZodTypeKind {
  Completable = "McpCompletable",
}

export interface CompletableDef<T extends ZodTypeAny = ZodTypeAny> extends ZodTypeDef {
  type: T;
  complete: CompleteCallback<T>;
  typeName: McpZodTypeKind.Completable;
}

export class Completable<T extends ZodTypeAny> extends ZodType<T["_output"], CompletableDef<T>, T["_input"]> {
  _parse(input: ParseInput): ParseReturnType<T["_output"]> {
    const { type } = this._def;
    return type._parse(input);
  }

  unwrap() {
    return this._def.type;
  }

  static create = <T extends ZodTypeAny>(
    type: T,
    params: { complete: CompleteCallback<T> }
  ): Completable<T> => {
    return new Completable({
      typeName: McpZodTypeKind.Completable,
      type,
      complete: params.complete,
    } as CompletableDef<T>);
  };
}

export function completable<T extends ZodTypeAny>(
  schema: T,
  complete: CompleteCallback<T>
): Completable<T> {
  return Completable.create(schema, { complete });
}
