module.exports = function(RED) {
    const ffmpeg = require('fluent-ffmpeg');
    const path = require('path');

    function RTMPRecorderNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        let ffmpegProcess = null;
        
        node.on('input', function(msg) {
            const rtmpKey = config.rtmpKey || msg.rtmpKey;
            const rtmpUrl = config.rtmpUrl || msg.rtmpUrl;
            const outputPath = config.outputPath || msg.outputPath;

            if (!rtmpUrl || !rtmpKey || !outputPath) {
                node.error('RTMP URL,KEY and output file path are required.');
                return;
            }

            if (msg.payload === 'stop') {
                if (ffmpegProcess) {
                    ffmpegProcess.on('end', () => {
                        node.log('FFmpeg recording stopped.');
                        ffmpegProcess = null;
                    });
                    ffmpegProcess.on('error', (err) => {
                        node.error('An error occurred while stopping: ' + err.message);
                        ffmpegProcess = null;
                    });
                    ffmpegProcess.kill('SIGINT');
                } else {
                    node.warn('No recording to stop.');
                }
                return;
            }

            const command = ffmpeg(rtmpUrl+'/'+rtmpKey)
                .output(outputPath)
                .on('start', function(commandLine) {
                    node.log('FFmpeg started with command: ' + commandLine);
                    node.send({ payload: `Recording started at ${outputPath}` });
                })
                .on('error', function(err) {
                    node.error('An error occurred: ' + err.message);
                })
                .on('end', function() {
                    node.log('FFmpeg finished recording.');
                })
                .run();
        });
        node.on('close', function(done) {
            if (ffmpegProcess) {
                ffmpegProcess.on('end', () => {
                    ffmpegProcess = null;
                    done();
                });
                ffmpegProcess.on('error', () => {
                    ffmpegProcess = null;
                    done();
                });
                ffmpegProcess.kill('SIGINT');
            } else {
                done();
            }
        });
    }

    RED.nodes.registerType('recorder', RTMPRecorderNode);
};
