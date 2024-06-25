module.exports = function (RED) {
  const ffmpeg = require("fluent-ffmpeg");
  const path = require("path");

  function RTMPRecorderNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let ffmpegProcess = null;

    node.on("input", function (msg) {
      const rtmpKey = config.rtmpKey || msg.rtmpKey;
      let rtmpUrl = config.rtmpUrl || msg.rtmpUrl;
      rtmpUrl += "/" + rtmpKey;
      const outputPath = config.outputPath || msg.outputPath;

      if (!rtmpUrl || !rtmpKey || !outputPath) {
        node.error("RTMP URL,KEY and output file path are required.");
        return;
      }

      if (msg.payload === "stop") {
        if (ffmpegProcess) {
          node.log("Stopping FFmpeg process...");
          ffmpegProcess.kill("SIGINT");
          ffmpegProcess = null;
        } else {
          node.warn("No recording to stop.");
        }
        return;
      }

      if (ffmpegProcess) {
        node.warn("Recording already in progress.");
        return;
      }

      node.log("Starting FFmpeg process...");
      ffmpegProcess = ffmpeg(rtmpUrl)
        .output(outputPath)
        .on("start", function (commandLine) {
          node.log("FFmpeg started with command: " + commandLine);
          node.status({ fill: "green", shape: "dot", text: "recording" });
        })
        .on("error", function (err) {
          node.error("An error occurred: " + err.message);
          ffmpegProcess = null;
        })
        .on("end", function () {
          node.log("FFmpeg finished recording.");
          ffmpegProcess = null;
        })
        .run();
    });

    node.on("close", function (done) {
      if (ffmpegProcess) {
        ffmpegProcess.on("end", () => {
          ffmpegProcess = null;
          done();
        });
        ffmpegProcess.on("error", () => {
          ffmpegProcess = null;
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
