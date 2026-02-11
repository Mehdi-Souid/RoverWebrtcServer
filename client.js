let ws = null;
let peerConnection = null;

const ICE_SERVERS = [
    {urls: 'stun:stun.l.google.com:19302'},
    {urls: 'stun:stun1.l.google.com:19302'},
    {urls: 'stun:stun2.l.google.com:19302'},
    {urls: 'stun:stun3.l.google.com:19302'},
    {urls: 'stun:stun4.l.google.com:19302'},
    {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    },
    {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    },
    {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    },
    {urls: 'stun:global.stun.twilio.com:3478'},
    {
        urls: 'turn:a.relay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    },
    {
        urls: 'turn:a.relay.metered.ca:80?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    },
    {
        urls: 'turn:a.relay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    },
    {
        urls: 'turn:a.relay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    }
];

window.onload = () => {
    connectSignaling();
};

function connectSignaling() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        ws.send(JSON.stringify({
            type: 'register',
            role: 'pc'
        }));
    };

    ws.onmessage = async (event) => {
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'offer') {
                await handleOffer(message.sdp);
            } else if (message.type === 'ice-candidate') {
                await handleIceCandidate(message.candidate);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    ws.onclose = () => {
        setTimeout(connectSignaling, 3000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

async function handleOffer(sdp) {
    if (!peerConnection) {
        createPeerConnection();
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription({
        type: 'offer',
        sdp: sdp
    }));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    ws.send(JSON.stringify({
        type: 'answer',
        sdp: answer.sdp
    }));
}

async function handleIceCandidate(candidate) {
    if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
}

function createPeerConnection() {
    peerConnection = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
    });

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('[PC] ICE candidate:', event.candidate.type, event.candidate.candidate);
            ws.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate.toJSON()
            }));
        } else {
            console.log('[PC] ICE gathering complete');
        }
    };

    peerConnection.onconnectionstatechange = () => {
        console.log('[PC] Connection state:', peerConnection.connectionState);
    };

    peerConnection.oniceconnectionstatechange = () => {
        console.log('[PC] ICE connection state:', peerConnection.iceConnectionState);
    };

    peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
            document.getElementById('remoteVideo').srcObject = event.streams[0];
        }
    };
}

