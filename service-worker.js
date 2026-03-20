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
    "url": "04f35e6abd32edce5be7.css",
    "revision": null
  }, {
    "url": "2c27e2d002fb0963f29b.svg",
    "revision": null
  }, {
    "url": "376884e8dd79a0eec4c0.svg",
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
    "url": "c90ed23523223bd8215b.svg",
    "revision": null
  }, {
    "url": "edit.bundle.js",
    "revision": "4bb6be9b79c73f550434af725b0533c9"
  }, {
    "url": "edit.html",
    "revision": "c2c19bb8510cc9e5cb74bbd91e2ea58d"
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
    "revision": "57ef0f28577b87786c40f33e595d4a3b"
  }, {
    "url": "index.html",
    "revision": "e935b7a0a3b5f1128ceb01754bac20b4"
  }, {
    "url": "page_js-pack_ts.bundle.js",
    "revision": "d07ab78654ce2d5b769d053873f80849"
  }, {
    "url": "play.bundle.js",
    "revision": "748123afa5d7c6c7f4f550daf2058c58"
  }, {
    "url": "play.html",
    "revision": "e5fee375817ad34149eae0d6163a7cb1"
  }, {
    "url": "player_ts.bundle.js",
    "revision": "c51db15858cf9be96ed489bb4563cf2f"
  }, {
    "url": "test.bundle.js",
    "revision": "81f15898e6d3ac72fdce20c704d8bfeb"
  }, {
    "url": "test.html",
    "revision": "a1e8dd1adf171e99712f9347751eab38"
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
