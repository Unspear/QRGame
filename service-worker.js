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
    "url": "d18af635b16961150e6d.css",
    "revision": null
  }, {
    "url": "edit.bundle.js",
    "revision": "5fef040294874516a7ae5cf98cf299e2"
  }, {
    "url": "edit.html",
    "revision": "6c8341f5647449c2b061f01ff529ee40"
  }, {
    "url": "ee4bb51207f4039a78af.wasm",
    "revision": null
  }, {
    "url": "icon-16.png",
    "revision": "2d735d5a8a1ad54b1fbddc346c40d1ce"
  }, {
    "url": "index.bundle.js",
    "revision": "ae2cc08188e0ca321cbbc66c90ebd2b5"
  }, {
    "url": "index.html",
    "revision": "fe3b50faeb4fd9d5b18d5129ba508a5e"
  }, {
    "url": "play.bundle.js",
    "revision": "cb7dd1f92be51d240ad9736b9b6da919"
  }, {
    "url": "play.html",
    "revision": "7e877677f9ef1a0a38a38ec8b18b4362"
  }, {
    "url": "src_style_css-src_engine_js-src_pack_js-src_pwa_js.bundle.js",
    "revision": "5329cdbf57085da5224b4c73fa8d2b62"
  }, {
    "url": "vendors-node_modules_brotli-wasm_index_web_js-node_modules_fflate_esm_browser_js-node_modules-131452.bundle.js",
    "revision": "b232f222aecb05ebb6bd14cd56091100"
  }, {
    "url": "vendors-node_modules_matter-js_build_matter_js-node_modules_sam-js_dist_samjs_esm_min_js-node-0d8a77.bundle.js",
    "revision": "8acfc427622142758096ba8b58cff7d7"
  }], {});

}));
//# sourceMappingURL=service-worker.js.map
