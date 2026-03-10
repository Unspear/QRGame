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
    "url": "388aae3f50c9db2aa2ab.css",
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
    "url": "84576ba241a5e4a9a110.wasm",
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
    "revision": "99082e60523673d355457ba13f762b54"
  }, {
    "url": "edit.html",
    "revision": "1b260cc1cf7934d634b4cb4774efa7c9"
  }, {
    "url": "favicon.png",
    "revision": "2d735d5a8a1ad54b1fbddc346c40d1ce"
  }, {
    "url": "icon-16.png",
    "revision": "2d735d5a8a1ad54b1fbddc346c40d1ce"
  }, {
    "url": "icon-192.png",
    "revision": "4ef5eabbc5ce433e107ff92d2c3ed755"
  }, {
    "url": "icon-512.png",
    "revision": "9e211cbc65c7ba616f140a5743981e29"
  }, {
    "url": "index.bundle.js",
    "revision": "13d25ab7b12f1149221e786aedf32ae3"
  }, {
    "url": "index.html",
    "revision": "062cbb65e6838683bb67660497a3f724"
  }, {
    "url": "page_js-pack_ts.bundle.js",
    "revision": "03706b27eb8069061bb4d7b1a6188c72"
  }, {
    "url": "play.bundle.js",
    "revision": "e0ef3e9fe76064343e9035852c3e2667"
  }, {
    "url": "play.html",
    "revision": "7ac9eca63c78cd1debea5e677ba9e2e2"
  }, {
    "url": "player_ts.bundle.js",
    "revision": "dcc88b9f4420095c345d5d8b607ef913"
  }, {
    "url": "test.bundle.js",
    "revision": "16cc68d435e33260c45d4883a0e4b0fc"
  }, {
    "url": "test.html",
    "revision": "a359836d9a038f348bea3795699e0099"
  }, {
    "url": "vendors-node_modules_brotli-wasm_index_web_js-node_modules_fflate_esm_browser_js.bundle.js",
    "revision": "8d90ea14d30c855f3fe0f7e662f713cc"
  }, {
    "url": "vendors-node_modules_codemirror_legacy-modes_mode_lua_js-node_modules_codemirror_dist_index_js.bundle.js",
    "revision": "b6545d97fc74e7c80a5be3eca0a936a2"
  }, {
    "url": "vendors-node_modules_matter-js_build_matter_js.bundle.js",
    "revision": "f72b1988b2dd9d40f3afa5803fe384fd"
  }, {
    "url": "vendors-node_modules_sam-js_dist_samjs_esm_min_js-node_modules_wasmoon_dist_index_js-node_mod-cf248f.bundle.js",
    "revision": "63cd1419d5164b46a0a42e993e5e92e8"
  }], {});

}));
//# sourceMappingURL=service-worker.js.map
