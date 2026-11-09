# Rover WebRTC Server

A lightweight signaling server that streams a rover's camera from a mobile device to a PC browser over WebRTC. Built as the camera relay for a robotics project.

## How It Works

```
Mobile (camera) ──WebSocket signaling──► Server ◄──WebSocket signaling── PC browser
        └────────────── WebRTC video (direct, or through a TURN relay) ──────────────┘
```

1. The mobile device and the PC each connect over WebSocket and register their role (`mobile` / `pc`).
2. The server forwards the WebRTC `offer`, `answer` and `ice-candidate` messages between them.
3. The video then flows peer-to-peer, or through a TURN server when NAT blocks a direct path.

## Features

- WebSocket signaling and HTTP on a single port (Render-ready, uses `PORT`)
- Browser dashboard (`/dashboard`) that receives and displays the video stream
- `/ice-servers` endpoint that gives clients STUN/TURN settings from environment variables, so credentials never appear in client code
- `/health` endpoint showing which clients are connected
- `/test-turn` page to check TURN server connectivity

## Tech Stack

Node.js · ws (WebSocket) · WebRTC · STUN/TURN · HTML / JavaScript

## Getting Started

```bash
npm install
# Optional TURN relay (e.g. Metered):
#   TURN_USERNAME=...  TURN_CREDENTIAL=...  [TURN_HOST=standard.relay.metered.ca]
npm start                       # http://localhost:9000/dashboard
```

| Variable | Purpose |
|---|---|
| `PORT` | HTTP/WebSocket port (default 9000) |
| `TURN_USERNAME`, `TURN_CREDENTIAL` | TURN relay credentials (optional) |
| `TURN_HOST` | TURN host (default `standard.relay.metered.ca`) |
