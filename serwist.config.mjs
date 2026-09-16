// @ts-check
import { serwist } from "@serwist/next/config";

export default serwist({
  swSrc: "app/sw.js",
  swDest: "public/sw.js",
});
