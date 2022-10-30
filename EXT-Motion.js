/*******************
*  EXT-Motion v1.0 *
*  Bugsounet       *
*  10/2022         *
*******************/

Module.register("EXT-Motion", {
  defaults: {
    debug: false,
    captureIntervalTime: 1000,
    scoreThreshold: 20,
    deviceId: null
  },

  start: function() {
    if (this.data.position) this.data.position = undefined
    if (this.config.captureIntervalTime < 1000) this.config.captureIntervalTime = 1000
    if (this.config.scoreThreshold < 20) this.config.scoreThreshold = 20
  },

  getScripts: function () {
    return ["/modules/EXT-Motion/lib/diff-cam-engine.js"]
  },

  notificationReceived: function (notification, payload, sender) {
    switch(notification) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.config)
        this.camEngine()
        break
      case "GAv4_READY":
        if (sender.name == "MMM-GoogleAssistant") this.sendNotification("EXT_HELLO", this.name)
        break
      case "EXT_MOTION-STOP":
        if (DiffCamEngine.initialized && DiffCamEngine.started) {
          DiffCamEngine.stop()
        }
        break
      case "EXT_MOTION-START":
        if (DiffCamEngine.initialized && !DiffCamEngine.started) {
          DiffCamEngine.start()
        }
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
        Log.info("[MOTION] DiffCamEngine init successful.")
        this.sendSocketNotification("INITIALIZED")
        DiffCamEngine.start()
      },
      initErrorCallback: (error) => {
        Log.error("[MOTION] DiffCamEngine init failed: " + error)
        this.sendSocketNotification("ERROR", error.toString())
        this.sendNotification("EXT_ALERT", {
          message: "EXT-Motion init failed!",
          type: "error"
        })
      },
      startCompleteCallback: () => {
        Log.info("[MOTION] Motion is now Started")
        this.sendSocketNotification("STARTED")
      },
      stopCompleteCallback: () => {
        Log.info("[MOTION] Motion is now Stopped")
        this.sendSocketNotification("STOPPED")
      },
      captureCallback: ({ score, hasMotion }) => {
        if (hasMotion) {
          Log.info("[MOTION] Motion detected, score " + score)
          this.sendNotification("EXT_SCREEN-WAKEUP")
          this.sendSocketNotification("DETECTED", score)
        }
      }
    })
  }
});
