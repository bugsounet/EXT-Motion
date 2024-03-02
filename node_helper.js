/******************************
* node_helper for EXT-Motion  *
* BuGsounet ©03/24            *
*******************************/

var log = (...args) => { /* do nothing */ };
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  socketNotificationReceived (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload;
        if (this.config.debug) log = (...args) => { console.log("[MOTION]", ...args); };
        console.log("[MOTION] EXT-Motion Version:", require("./package.json").version, "rev:", require("./package.json").rev);
        break;
      case "INITIALIZED":
        log("Initialized!");
        break;
      case "DETECTED":
        log("Detected Motion, score:", payload);
        break;
      case "STARTED":
        log("Started!");
        break;
      case "STOPPED":
        log("Stopped!");
        break;
      case "DESTROYED":
        log("Destroyed!");
        break;
      case "ERROR":
        console.error(`[MOTION] DiffCamEngine initialize failed: ${  payload}`);
        break;
    }
  }
});
