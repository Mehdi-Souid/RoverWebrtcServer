# 🚀 Render.com Deployment Guide

## ✅ Code is Ready and Pushed to GitHub!

**Repository**: https://github.com/Mehdi-Souid/RoverWebrtcServer.git

**Latest commit**: Fixed Render.com deployment with proper port binding

---

## 📋 Deploy to Render.com (Step-by-Step)

### **Step 1: Go to Render Dashboard**

Visit: https://dashboard.render.com

- If not logged in, sign in
- If no account, click "Get Started" (free, no credit card needed)

---

### **Step 2: Create New Web Service**

1. Click **"New +"** button (top right)
2. Select **"Web Service"**

---

### **Step 3: Connect GitHub Repository**

1. Click **"Connect GitHub"** (if not already connected)
2. Authorize Render to access your GitHub
3. Find repository: **"RoverWebrtcServer"**
4. Click **"Connect"**

---

### **Step 4: Configure Web Service**

Fill in these settings:

**Basic Settings**:
- **Name**: `rover-webrtc` (or any name you like)
- **Region**: Choose closest to you (e.g., Frankfurt, Oregon, Singapore)
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Instance Type**:
- **Plan**: **Free** ✅

**Advanced Settings** (click "Advanced"):
- **Auto-Deploy**: Yes (recommended - auto-deploys on git push)

---

### **Step 5: Create Web Service**

Click **"Create Web Service"** button at the bottom

---

### **Step 6: Wait for Deployment**

Render will now:
1. ✅ Clone your repository
2. ✅ Install dependencies (`npm install`)
3. ✅ Start server (`node server.js`)
4. ✅ Assign a URL

**Expected time**: 2-3 minutes

**You'll see logs like**:
```
==> Cloning from https://github.com/Mehdi-Souid/RoverWebrtcServer
==> Running build command 'npm install'...
==> Build successful 🎉
==> Deploying...
==> Your service is live at https://rover-webrtc.onrender.com
```

---

### **Step 7: Get Your URL**

Once deployed, Render gives you a URL like:
```
https://rover-webrtc.onrender.com
```

**Copy this URL!** You'll need it for your Android app.

---

## 📱 Update Android App

### **Convert HTTP to WSS**

Your Render URL is HTTPS, so WebSocket must use **WSS** (secure):

**Render URL**: `https://rover-webrtc.onrender.com`
**WebSocket URL**: `wss://rover-webrtc.onrender.com`

### **Update Android App**

On your Android device:
```
Server URL: wss://rover-webrtc.onrender.com
```

**Important**: 
- Use `wss://` (not `ws://`)
- No port number needed
- Replace with YOUR actual Render URL

---

## 🧪 Test the Deployment

### **Test 1: Check Server Health**

Visit in browser:
```
https://rover-webrtc.onrender.com/health
```

Should show:
```json
{"status":"ok","clients":{"mobile":false,"pc":false}}
```

✅ If you see this, server is working!

---

### **Test 2: Open Web Dashboard**

Visit in browser:
```
https://rover-webrtc.onrender.com
```

You should see the Rover WebRTC dashboard.

---

### **Test 3: Connect from Android**

1. **Android**: Turn OFF WiFi (use mobile data)
2. **Server URL**: `wss://rover-webrtc.onrender.com`
3. **Tap**: "START STREAMING"
4. **First time**: Wait 20-30 seconds (server waking up)
5. **Should connect!** ✅

---

## 💤 Understanding "Sleep" on Free Tier

### **What Happens**:

**After 15 minutes of no activity**:
- Server goes to sleep 💤
- Saves Render's resources

**When you connect again**:
- Server wakes up (takes 20-30 seconds)
- Then works normally

### **First Connection of the Day**:
```
1. Tap "START STREAMING"
2. Wait 20-30 seconds ⏳
3. Server wakes up
4. Connection established ✅
```

### **Subsequent Connections** (within 15 min):
```
1. Tap "START STREAMING"
2. Connects in 1-2 seconds ⚡
```

---

## 🔧 Troubleshooting

### **Issue: Deployment Failed**

**Check Render logs**:
1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for errors

**Common fixes**:
- Make sure `package.json` exists
- Make sure `server.js` exists
- Check build command is `npm install`
- Check start command is `node server.js`

---

### **Issue: "Timed Out" Error**

This was the original issue - **now fixed!**

The fix:
- ✅ Server now properly binds to PORT environment variable
- ✅ Added error handling
- ✅ Added startup logs

If you still see this:
1. Check Render logs
2. Make sure latest code is pushed to GitHub
3. Trigger manual deploy (Dashboard → Manual Deploy)

---

### **Issue: Can't Connect from Android**

**Check**:
1. ✅ Using `wss://` (not `ws://`)
2. ✅ Using correct Render URL
3. ✅ Server is deployed (check dashboard)
4. ✅ Server health check works
5. ✅ Wait 30 seconds on first connection (wake up time)

---

### **Issue: Connection Drops**

**Possible causes**:
- Free TURN server is unreliable
- Network issues
- Server went to sleep

**Solutions**:
- Reconnect (server will wake up)
- Use paid TURN server (Metered.ca)
- Upgrade to paid Render plan (no sleep)

---

## 🔄 Update Deployment

### **Automatic Updates** (if Auto-Deploy enabled):

1. Make changes to code locally
2. Commit: `git commit -m "Your message"`
3. Push: `git push origin main`
4. Render automatically deploys! ✅

### **Manual Deploy**:

1. Go to Render dashboard
2. Click on your service
3. Click "Manual Deploy" → "Deploy latest commit"

---

## 📊 Monitor Your Service

### **Render Dashboard**:

**Logs**: See all server output
- Click "Logs" tab
- See connection logs, errors, etc.

**Metrics**: See usage stats
- Click "Metrics" tab
- See requests, CPU, memory

**Events**: See deployment history
- Click "Events" tab
- See all deploys, restarts

---

## 💰 Free Tier Limits

**Render Free Tier**:
- ✅ 750 hours/month (enough for 24/7)
- ✅ Unlimited bandwidth
- ✅ Unlimited requests
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 512 MB RAM
- ⚠️ 0.1 CPU

**Good for**:
- Testing
- Personal use
- Low traffic apps

**Upgrade if**:
- Need instant connection (no sleep)
- High traffic
- Need more resources

---

## 🎯 Expected Performance

### **With Render.com + Free TURN**:

**Latency**:
- Same network: 80-120ms
- Different network: 150-250ms

**Connection Time**:
- First time (wake up): 20-30 seconds
- Subsequent: 1-2 seconds

**Reliability**:
- Good for testing
- May be slow during peak hours (free TURN)

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web Service created
- [ ] Deployment successful
- [ ] Health check works
- [ ] Web dashboard accessible
- [ ] Android app updated with `wss://` URL
- [ ] Tested connection from mobile data

---

## 🚀 You're All Set!

**Your server is now**:
- ✅ Deployed to cloud
- ✅ Accessible from anywhere
- ✅ No port forwarding needed
- ✅ Free forever (with sleep)

**Android app can connect from**:
- ✅ Any WiFi network
- ✅ Mobile data (4G/5G)
- ✅ Anywhere in the world

---

**Enjoy your low-latency WebRTC streaming!** 🎉

