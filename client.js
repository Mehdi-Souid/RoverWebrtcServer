/**
 * Rover WebRTC - PC Client
 * Browser-based WebRTC receiver optimized for low latency
 */

let ws = null;
let peerConnection = null;
let remoteStream = null;

// STUN + TURN servers for NAT traversal
// STUN: Works on same network
// TURN: Works on different networks (relay)
const ICE_SERVERS = [
    // Google's free STUN servers
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
    {urls: 'stun:stun2.l.google.com:19302'},
    // Free public TURN server (for different networks)
    {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    },
    {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    }
];

// Initialize on page load
window.onload = () => {
    console.log('[PC] Initializing...');
    connectSignaling();
};

// Connect to signaling server
function connectSignaling() {
    console.log('[PC] Connecting to signaling server...');

    // Auto-detect WebSocket URL based on page URL
    // If page is HTTPS, use WSS; if HTTP, use WS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // includes hostname and port
    const wsUrl = `${protocol}//${host}`;

    console.log('[PC] WebSocket URL:', wsUrl);
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('[PC] Connected to signaling server');
        updateSignalingStatus(true);
        
        // Register as PC client
        ws.send(JSON.stringify({
            type: 'register',
            role: 'pc'
        }));
    };

    ws.onmessage = async (event) => {
        try {
            const message = JSON.parse(event.data);
            console.log('[PC] Received:', message.type);

            if (message.type === 'offer') {
                await handleOffer(message.sdp);
            } else if (message.type === 'ice-candidate') {
                await handleIceCandidate(message.candidate);
            }
        } catch (error) {
            console.error('[PC] Error handling message:', error);
        }
    };

    ws.onclose = () => {
        console.log('[PC] Disconnected from signaling server');
        updateSignalingStatus(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connectSignaling, 3000);
    };

    ws.onerror = (error) => {
        console.error('[PC] WebSocket error:', error);
    };
}

// Handle offer from mobile
async function handleOffer(sdp) {
    console.log('[PC] Handling offer...');

    // Create peer connection if not exists
    if (!peerConnection) {
        createPeerConnection();
    }

    // Set remote description
    await peerConnection.setRemoteDescription(new RTCSessionDescription({
        type: 'offer',
        sdp: sdp
    }));

    // Create answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send answer back
    ws.send(JSON.stringify({
        type: 'answer',
        sdp: answer.sdp
    }));

    console.log('[PC] Answer sent');
}

// Handle ICE candidate from mobile
async function handleIceCandidate(candidate) {
    if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('[PC] ICE candidate added');
    }
}

// Create WebRTC peer connection
function createPeerConnection() {
    console.log('[PC] Creating peer connection...');

    peerConnection = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate.toJSON()
            }));
            console.log('[PC] ICE candidate sent');
        }
    };

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
        console.log('[PC] Received remote track');
        
        const video = document.getElementById('remoteVideo');
        const placeholder = document.getElementById('placeholder');
        const streamingIndicator = document.getElementById('streamingIndicator');
        const stats = document.getElementById('stats');

        if (event.streams && event.streams[0]) {
            remoteStream = event.streams[0];
            video.srcObject = remoteStream;
            
            // Hide placeholder, show video
            placeholder.style.display = 'none';
            video.style.display = 'block';
            streamingIndicator.classList.add('active');
            stats.classList.add('active');

            // Start stats monitoring
            startStatsMonitoring();
        }
    };

    // Monitor connection state
    peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        console.log('[PC] Connection state:', state);
        updateWebRTCStatus(state);

        if (state === 'disconnected' || state === 'failed' || state === 'closed') {
            const video = document.getElementById('remoteVideo');
            const placeholder = document.getElementById('placeholder');
            const streamingIndicator = document.getElementById('streamingIndicator');
            const stats = document.getElementById('stats');

            video.style.display = 'none';
            placeholder.style.display = 'block';
            streamingIndicator.classList.remove('active');
            stats.classList.remove('active');
        }
    };

    console.log('[PC] Peer connection created');
}

// Update signaling status UI
function updateSignalingStatus(connected) {
    const dot = document.getElementById('signalingStatus');
    const text = document.getElementById('signalingText');
    
    if (connected) {
        dot.classList.add('connected');
        text.textContent = 'Signaling: Connected';
    } else {
        dot.classList.remove('connected');
        text.textContent = 'Signaling: Disconnected';
    }
}

// Update WebRTC status UI
function updateWebRTCStatus(state) {
    const dot = document.getElementById('webrtcStatus');
    const text = document.getElementById('webrtcText');
    
    text.textContent = 'WebRTC: ' + state;
    
    if (state === 'connected') {
        dot.classList.add('connected');
    } else {
        dot.classList.remove('connected');
    }
}

// Monitor WebRTC stats
function startStatsMonitoring() {
    setInterval(async () => {
        if (!peerConnection) return;

        const stats = await peerConnection.getStats();
        stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
                // Update resolution
                if (report.frameWidth && report.frameHeight) {
                    document.getElementById('resolution').textContent = 
                        report.frameWidth + 'x' + report.frameHeight;
                }

                // Update FPS
                if (report.framesPerSecond) {
                    document.getElementById('fps').textContent = 
                        Math.round(report.framesPerSecond) + ' fps';
                }

                // Update bitrate
                if (report.bytesReceived) {
                    const bitrate = Math.round(report.bytesReceived * 8 / 1000);
                    document.getElementById('bitrate').textContent = 
                        bitrate + ' kbps';
                }
            }
        });
    }, 1000);
}

