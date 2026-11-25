// Matches the `*.mp4` Turbopack rule in next.config.ts (`type: "asset"`):
// importing a clip yields its emitted URL.
declare module "*.mp4" {
  const src: string;
  export default src;
}
