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

  // Health check FIRST - Render checks this immediately
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status: 'ok', clients: {mobile: !!mobileClient, pc: !!pcClient}}));
    return;
  }

  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    });
  } else if (req.url === '/client.js') {
    fs.readFile(path.join(__dirname, 'client.js'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading client.js');
        return;
      }
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Create WebSocket server on same port as HTTP
const wss = new WebSocket.Server({server: httpServer});

let mobileClient = null;
let pcClient = null;

wss.on('connection', (ws) => {
  console.log('[Signaling] New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('[Signaling] Received:', data.type);

      // Handle client registration
      if (data.type === 'register') {
        if (data.role === 'mobile') {
          mobileClient = ws;
          console.log('[Signaling] Mobile client registered');
        } else if (data.role === 'pc') {
          pcClient = ws;
          console.log('[Signaling] PC client registered');
        }
        return;
      }

      // Forward signaling messages between peers
      if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
        // If message from mobile, send to PC
        if (ws === mobileClient && pcClient && pcClient.readyState === WebSocket.OPEN) {
          pcClient.send(message.toString());
          console.log('[Signaling] Forwarded', data.type, 'to PC');
        }
        // If message from PC, send to mobile
        else if (ws === pcClient && mobileClient && mobileClient.readyState === WebSocket.OPEN) {
          mobileClient.send(message.toString());
          console.log('[Signaling] Forwarded', data.type, 'to mobile');
        }
      }
    } catch (error) {
      console.error('[Signaling] Error processing message:', error.message);
    }
  });

  ws.on('close', () => {
    console.log('[Signaling] Client disconnected');
    if (ws === mobileClient) {
      mobileClient = null;
      console.log('[Signaling] Mobile client disconnected');
    } else if (ws === pcClient) {
      pcClient = null;
      console.log('[Signaling] PC client disconnected');
    }
  });

  ws.on('error', (error) => {
    console.error('[Signaling] WebSocket error:', error);
  });
});

// Start server - Render requires binding to 0.0.0.0 and the PORT env variable
const server = httpServer.listen(PORT, '0.0.0.0', () => {
  const actualPort = server.address().port;
  console.log('\n🚀 Rover WebRTC Cloud Server Started!\n');
  console.log('=====================================');
  console.log('Port:', actualPort);
  console.log('Host: 0.0.0.0');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Render PORT env:', process.env.PORT);
  console.log('=====================================\n');
  console.log('✅ Server is live and ready to accept connections!');
  console.log('✅ HTTP server listening on port', actualPort);
  console.log('✅ WebSocket server ready');
  console.log('✅ Health check available at /health');
});

// Error handling for server
httpServer.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, closing server...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

