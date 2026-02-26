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
    "url": "3de0dbada69323d7b522.css",
    "revision": null
  }, {
    "url": "3f53db599ee755d90efd.wasm",
    "revision": null
  }, {
    "url": "84576ba241a5e4a9a110.wasm",
    "revision": null
  }, {
    "url": "_9995.bundle.js",
    "revision": "31c7f5828c1cc95849d66c63f6e87f41"
  }, {
    "url": "c2701bfe48f352bd883e.wasm",
    "revision": null
  }, {
    "url": "d8a5c13deffe5116d1ad.png",
    "revision": null
  }, {
    "url": "edit.bundle.js",
    "revision": "331172086835964bdbf742cc21e92d44"
  }, {
    "url": "edit.html",
    "revision": "2365f044ee32dcfc6a8f01f0ad284212"
  }, {
    "url": "icon-16.png",
    "revision": "2d735d5a8a1ad54b1fbddc346c40d1ce"
  }, {
    "url": "index.bundle.js",
    "revision": "ba9a8942a1f417e9f32dbf2678fd7359"
  }, {
    "url": "index.html",
    "revision": "fd3516f5def414d7fab1182c65c271d5"
  }, {
    "url": "play.bundle.js",
    "revision": "b10cc409c9ce42953ede09952f725cee"
  }, {
    "url": "play.html",
    "revision": "a3d0f626dd719f6cb9a87991c29cc57d"
  }, {
    "url": "src_page_js-src_pack_ts.bundle.js",
    "revision": "16129a64cc5caf25f55b67f60d2ac10c"
  }, {
    "url": "src_player_ts.bundle.js",
    "revision": "e86b27180d5de0c37726ac9bdf168bfc"
  }, {
    "url": "test.bundle.js",
    "revision": "c18086f3e8215ae595249b2b4a8d0b06"
  }, {
    "url": "test.html",
    "revision": "e9e5895782b0ed13aa64b7a5ecd26185"
  }, {
    "url": "vendors-node_modules_brotli-wasm_index_web_js-node_modules_fflate_esm_browser_js.bundle.js",
    "revision": "ecb71e3bd29e11fa6be1ae02ca5a5c99"
  }, {
    "url": "vendors-node_modules_codemirror_legacy-modes_mode_lua_js-node_modules_codemirror_dist_index_js.bundle.js",
    "revision": "8167d382401d442b99c7d389b8b601d4"
  }, {
    "url": "vendors-node_modules_matter-js_build_matter_js.bundle.js",
    "revision": "fcf4548b169b68267c110283433027fe"
  }, {
    "url": "vendors-node_modules_sam-js_dist_samjs_esm_min_js-node_modules_wasmoon_dist_index_js-node_mod-cf248f.bundle.js",
    "revision": "e703ead720c7b33a868205afce182dc6"
  }], {});

}));
//# sourceMappingURL=service-worker.js.map
