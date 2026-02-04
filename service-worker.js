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
    "url": "3f53db599ee755d90efd.wasm",
    "revision": null
  }, {
    "url": "4e0303d7a30105b9103f.png",
    "revision": null
  }, {
    "url": "_9995.bundle.js",
    "revision": "31c7f5828c1cc95849d66c63f6e87f41"
  }, {
    "url": "edit.bundle.js",
    "revision": "8d6a76e11fac7d4e8c6a794f18997501"
  }, {
    "url": "edit.html",
    "revision": "5c1a28dfb8ae8b130ef52e61a3bda3a2"
  }, {
    "url": "icon-16.png",
    "revision": "2d735d5a8a1ad54b1fbddc346c40d1ce"
  }, {
    "url": "index.bundle.js",
    "revision": "593e534eaf85310dc758ec6120166265"
  }, {
    "url": "index.html",
    "revision": "dd2dad5d355b5671761307293052f920"
  }, {
    "url": "play.bundle.js",
    "revision": "f8c47794452c8b6cfbbbfd7db531aa56"
  }, {
    "url": "play.html",
    "revision": "32d80c67fc28ead586c19fdb8e96c2cd"
  }, {
    "url": "src_style_css-src_engine_js-src_pack_js-src_pwa_js.bundle.js",
    "revision": "3435fb83800959e3a40f8690dabb8fc3"
  }, {
    "url": "vendors-node_modules_brotli-wasm_index_web_js-node_modules_css-loader_dist_runtime_api_js-nod-d2477f.bundle.js",
    "revision": "0814596612f9bc742a187aef1029f06d"
  }, {
    "url": "vendors-node_modules_fflate_esm_browser_js-node_modules_codemirror_legacy-modes_mode_lua_js-n-690802.bundle.js",
    "revision": "9acbbe0e3666a9721a5f2b66b0f1fb40"
  }], {});

}));
//# sourceMappingURL=service-worker.js.map
