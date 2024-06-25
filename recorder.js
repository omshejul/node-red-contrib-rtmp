module.exports = function (RED) {
  const ffmpeg = require("fluent-ffmpeg");
  const path = require("path");

  function RTMPRecorderNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let ffmpegProcess = null;
    let isRecording = false;

    node.on("input", function (msg) {
      const rtmpKey = config.rtmpKey || msg.rtmpKey;
      let rtmpUrl = config.rtmpUrl || msg.rtmpUrl;
      rtmpUrl += "/" + rtmpKey;
      const outputPath = config.outputPath || msg.outputPath;

      if (!rtmpUrl || !rtmpKey || !outputPath) {
        node.error("RTMP URL, KEY, and output file path are required.");
        return;
      }

      if (msg.payload === "stop") {
        if (ffmpegProcess && isRecording) {
          node.log("Stopping FFmpeg process...");
          ffmpegProcess.on("exit", () => {
            node.log("FFmpeg recording stopped.");
            node.status({});
            ffmpegProcess = null;
            isRecording = false;
          });
          ffmpegProcess.kill("SIGINT");
        } else {
          node.warn("No recording to stop.");
        }
        return;
      }

      if (isRecording) {
        node.warn("Recording already in progress.");
        return;
      }

      node.log("Starting FFmpeg process...");
      ffmpegProcess = ffmpeg(rtmpUrl)
        .output(outputPath)
        .on("start", function (commandLine) {
          node.log("FFmpeg started with command: " + commandLine);
          node.status({ fill: "green", shape: "dot", text: "recording" });
          isRecording = true;
        })
        .on("error", function (err) {
          node.error("An error occurred: " + err.message);
          node.status({});
          ffmpegProcess = null;
          isRecording = false;
        })
        .on("end", function () {
          node.log("FFmpeg finished recording.");
          node.status({});
          ffmpegProcess = null;
          isRecording = false;
        })
        .run();
    });

    node.on("close", function (done) {
      if (ffmpegProcess && isRecording) {
        ffmpegProcess.on("exit", () => {
          ffmpegProcess = null;
          isRecording = false;
          done();
        });
        ffmpegProcess.kill("SIGINT");
      } else {
        done();
      }
    });
  }

  RED.nodes.registerType("recorder", RTMPRecorderNode);
};
