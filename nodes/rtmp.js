module.exports = function(RED) {
    const ffmpeg = require('fluent-ffmpeg');
    const path = require('path');
    const fs = require('fs');

    function RTMPNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.on('input', function(msg) {
            const input = config.input || msg.input;
            const rtmpUrl = config.rtmpUrl || msg.rtmpUrl;

            if (!input || !rtmpUrl) {
                node.error('Input file and RTMP URL are required.');
                return;
            }

            const command = ffmpeg(input)
                .inputOptions(['-re'])
                .outputOptions(['-c:v libx264', '-b:v 1M', '-c:a aac', '-f flv'])
                .output(rtmpUrl)
                .on('start', function(commandLine) {
                    node.log('FFmpeg started with command: ' + commandLine);
                })
                .on('error', function(err) {
                    node.error('An error occurred: ' + err.message);
                })
                .on('end', function() {
                    node.log('FFmpeg finished streaming.');
                })
                .run();
        });
    }

    RED.nodes.registerType('rtmp', RTMPNode);
};
