/*******************
*  EXT-Motion v1.1 *
*  Bugsounet       *
*  10/2022         *
*******************/

var logMOTION = (...args) => { /* do nothing */ }

Module.register("EXT-Motion", {
  defaults: {
    debug: false,
    captureIntervalTime: 1000,
    scoreThreshold: 100,
    deviceId: null
  },

  start: function() {
    if (this.data.position) this.data.position = undefined
    if (this.config.captureIntervalTime < 1000) this.config.captureIntervalTime = 1000
    if (this.config.scoreThreshold < 20) this.config.scoreThreshold = 20
    if (this.config.debug) logMOTION = (...args) => { console.log("[MOTION]", ...args) }
    this.ready = false
  },

  getScripts: function () {
    return ["/modules/EXT-Motion/components/diff-cam-engine.js"]
  },

  notificationReceived: function (notification, payload, sender) {
    if (notification == "GA_READY") {
      if (sender.name == "MMM-GoogleAssistant") {
        this.sendSocketNotification("INIT", this.config)
        this.camEngine()
        this.ready = true
        this.sendNotification("EXT_HELLO", this.name)
      }
    }
    if (!this.ready) return

    switch(notification) {
      case "EXT_MOTION-STOP":
        if (DiffCamEngine.initialized && DiffCamEngine.started) DiffCamEngine.stop()
        break
      case "EXT_MOTION-DESTROY":
        if (DiffCamEngine.initialized) DiffCamEngine.destroy()
        break
      case "EXT_MOTION-START":
        if (DiffCamEngine.initialized && !DiffCamEngine.started) DiffCamEngine.start()
        break
      case "EXT_MOTION-INIT":
        if (!DiffCamEngine.initialized && !DiffCamEngine.started) this.camEngine()
        break
    }
  },

  camEngine: function() {
    const canvas = document.createElement("canvas")
    const video = document.createElement("video")
    const cameraPreview = document.createElement("div")
    cameraPreview.id = "cameraPreview"
    cameraPreview.style = "visibility:hidden;"
    cameraPreview.appendChild(video)

    DiffCamEngine.init({
      video: video,
      deviceId: this.config.deviceId,
      captureIntervalTime: this.config.captureIntervalTime,
      motionCanvas: canvas,
      scoreThreshold: this.config.scoreThreshold,
      initSuccessCallback: () => {
        logMOTION("DiffCamEngine init successful.")
        this.sendSocketNotification("INITIALIZED")
        DiffCamEngine.start()
      },
      initErrorCallback: (error) => {
        console.error("[MOTION] DiffCamEngine init failed: " + error)
        this.sendSocketNotification("ERROR", error.toString())
        this.sendNotification("EXT_ALERT", {
          message: "EXT-Motion init failed!",
          type: "error"
        })
      },
      startCompleteCallback: () => {
        logMOTION("Motion is now Started")
        this.sendSocketNotification("STARTED")
        this.sendNotification("EXT_MOTION-STARTED")
      },
      stopCompleteCallback: () => {
        logMOTION("Motion is now Stopped")
        this.sendSocketNotification("STOPPED")
        this.sendNotification("EXT_MOTION-STOPPED")
      },
      destroyCompleteCallback: () => {
        logMOTION("Motion is now Destroyed")
        this.sendSocketNotification("DESTROYED")
        this.sendNotification("EXT_MOTION-STOPPED")
      },
      captureCallback: ({ score, hasMotion }) => {
        if (hasMotion) {
          logMOTION("Motion detected, score " + score)
          this.sendNotification("EXT_SCREEN-WAKEUP")
          this.sendSocketNotification("DETECTED", score)
        }
      }
    })
  }
});
