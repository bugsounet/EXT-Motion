/**********************************
* node_helper for EXT-Motion v1.0 *
* BuGsounet ©10/22                *
**********************************/

const NodeHelper = require("node_helper")
var log = (...args) => { /* do nothing */ }

module.exports = NodeHelper.create({
  socketNotificationReceived: function (notification, payload) {
    switch(notification) {
      case "INIT":
        this.config = payload
        if (this.config.debug) log = (...args) => { console.log("[MOTION]", ...args) }
        console.log("[MOTION] EXT-Motion Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        break
      case "INITIALIZED":
        log("Initialized!")
        break
      case "DETECTED":
        log("Detected Motion, score:", payload)
        break
      case "STARTED":
        log("Started!")
        break
      case "STOPPED":
        log("Stopped!")
        break
      case "DESTROYED":
        log("Destroyed!")
        break
      case "ERROR":
        console.error("[MOTION] DiffCamEngine initialize failed: " + payload)
        break
    }
  }
});
