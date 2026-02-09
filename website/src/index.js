import './style.css';
import _ from './pwa.js'
import CppApp from "./compiled/app.js";
(async () => {
  let app = await CppApp();

  try {
    app.callMain();
  } catch (e) {
    console.error(e.stack);
  }
})();