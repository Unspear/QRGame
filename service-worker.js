/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b3ca1ef5'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "2c27e2d002fb0963f29b.svg",
    "revision": null
  }, {
    "url": "3f53db599ee755d90efd.wasm",
    "revision": null
  }, {
    "url": "4d10eef7edbee652c0b1.json",
    "revision": null
  }, {
    "url": "5a875fe39a17f0cc9c81.wasm",
    "revision": null
  }, {
    "url": "6cbc13b89c6fa5275a41.svg",
    "revision": null
  }, {
    "url": "7abd1f71baf49114aeb8.svg",
    "revision": null
  }, {
    "url": "84576ba241a5e4a9a110.wasm",
    "revision": null
  }, {
    "url": "86dba0d8d03edcf7ca0a.svg",
    "revision": null
  }, {
    "url": "8ab9f6a5f4328a5e0cae.png",
    "revision": null
  }, {
    "url": "_4118.bundle.js",
    "revision": "49d444f0e0eb1c3e27fa06b7908b8e11"
  }, {
    "url": "c2d13a665429ea85e8de.png",
    "revision": null
  }, {
    "url": "edit.bundle.js",
    "revision": "abd6fdc995be326635caafd1fce14bff"
  }, {
    "url": "edit.html",
    "revision": "ae0eefbd5991d5894b01f8fd6a64c7f3"
  }, {
    "url": "f96725c2900464888d52.css",
    "revision": null
  }, {
    "url": "favicon.png",
    "revision": "2d735d5a8a1ad54b1fbddc346c40d1ce"
  }, {
    "url": "icon-16.png",
    "revision": "2d735d5a8a1ad54b1fbddc346c40d1ce"
  }, {
    "url": "icon-192.png",
    "revision": "cc695c8520e83239c6535e4ba79363c3"
  }, {
    "url": "icon-512.png",
    "revision": "79aa064863ba7d727fd8bdb9ac2b5259"
  }, {
    "url": "index.bundle.js",
    "revision": "a95b1df6bf4566fd79a146ce49f49ee4"
  }, {
    "url": "index.html",
    "revision": "735bd78a309291f8aa809d8313a2fa44"
  }, {
    "url": "page_js-pack_ts.bundle.js",
    "revision": "b291d7f22ddace9e6246b80a07ffb51e"
  }, {
    "url": "play.bundle.js",
    "revision": "997c8909627c74670c070be2c22cb3f3"
  }, {
    "url": "play.html",
    "revision": "bdd252acc2571a5274d457408ad50720"
  }, {
    "url": "player_ts.bundle.js",
    "revision": "1d4cd9861039eefd1483c666a21f393f"
  }, {
    "url": "test.bundle.js",
    "revision": "f53c71577b568afb2f9a97b76852dac8"
  }, {
    "url": "test.html",
    "revision": "03b6fdfb5e8ca217924e2efb9067e31e"
  }, {
    "url": "vendors-node_modules_brotli-wasm_index_web_js-node_modules_fflate_esm_browser_js.bundle.js",
    "revision": "8d90ea14d30c855f3fe0f7e662f713cc"
  }, {
    "url": "vendors-node_modules_codemirror_legacy-modes_mode_lua_js-node_modules_codemirror_dist_index_js.bundle.js",
    "revision": "b6545d97fc74e7c80a5be3eca0a936a2"
  }, {
    "url": "vendors-node_modules_matter-js_build_matter_js-node_modules_sam-js_dist_samjs_esm_min_js-node-e3c053.bundle.js",
    "revision": "60688f07cb3f293f6b6e9d7b1646ce91"
  }], {});

}));
//# sourceMappingURL=service-worker.js.map
