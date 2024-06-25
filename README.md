# node-red-contrib-rtmp

A Node-RED node to stream RTMP (Real-Time Messaging Protocol) using FFmpeg.

## Overview

This Node-RED node allows you to stream video and audio to an RTMP server using FFmpeg. It supports a variety of input formats and provides a flexible way to integrate RTMP streaming into your Node-RED flows.

## Prerequisites

- Node-RED: [Installation guide](https://nodered.org/docs/getting-started/local)
- FFmpeg: Ensure FFmpeg is installed on your system.


## Example Flow

Here’s an example of a basic Node-RED flow that uses the `rtmp` node to stream a video to an RTMP server:

```json
[
    {
        "id": "ffmpeg-spawn",
        "type": "rtmp",
        "z": "flow_id",
        "name": "Stream to RTMP",
        "input": "/path/to/video.mp4",
        "rtmpUrl": "rtmp://your_rtmp_server/live/stream_key",
        "outputs": 1,
        "x": 400,
        "y": 200,
        "wires": [
            []
        ]
    },
    {
        "id": "inject-node",
        "type": "inject",
        "z": "flow_id",
        "name": "",
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "x": 200,
        "y": 200,
        "wires": [
            ["ffmpeg-spawn"]
        ]
    }
]
