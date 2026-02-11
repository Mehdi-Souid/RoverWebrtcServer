/**
 * Rover WebRTC - Cloud Signaling Server
 * Optimized for Render.com deployment
 */

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Use PORT from environment (Render provides this) or default to 9000
const PORT = process.env.PORT || 9000;

// Create HTTP server for web dashboard
const httpServer = http.createServer((req, res) => {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Root path - INSTANT response for Render health check
  if (req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Rover WebRTC Server - OK');
    return;
  }

  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status: 'ok', clients: {mobile: !!mobileClient, pc: !!pcClient}}));
    return;
  }

  // Dashboard
  if (req.url === '/dashboard' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    });
    return;
  }

  if (req.url === '/client.js') {
    fs.readFile(path.join(__dirname, 'client.js'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading client.js');
        return;
      }
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// Create WebSocket server on same port as HTTP
const wss = new WebSocket.Server({server: httpServer});

let mobileClient = null;
let pcClient = null;

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'register') {
        if (data.role === 'mobile') {
          mobileClient = ws;
        } else if (data.role === 'pc') {
          pcClient = ws;
        }
        return;
      }

      if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
        if (ws === mobileClient && pcClient && pcClient.readyState === WebSocket.OPEN) {
          pcClient.send(message.toString());
        } else if (ws === pcClient && mobileClient && mobileClient.readyState === WebSocket.OPEN) {
          mobileClient.send(message.toString());
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

  ws.on('close', () => {
    if (ws === mobileClient) {
      mobileClient = null;
    } else if (ws === pcClient) {
      pcClient = null;
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port', PORT);
});

httpServer.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  httpServer.close(() => process.exit(0));
});

