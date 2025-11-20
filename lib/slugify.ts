import slugify, { type Options } from "@sindresorhus/slugify";

const defaultOptions: Options = {
  lowercase: true,
  decamelize: true,
};

export function slug(string: string, options?: Options): string {
  return slugify(string, { ...defaultOptions, ...options });
}
