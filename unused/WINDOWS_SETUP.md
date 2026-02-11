# 🪟 Windows Server Setup Guide

## ✅ Quick Start (3 Steps)

### **Step 1: Install Node.js** (if not installed)

1. Download Node.js LTS from: https://nodejs.org/
2. Run the installer
3. Click "Next" through all steps (use defaults)
4. Restart your computer

**Verify installation**:
```cmd
node --version
npm --version
```

---

### **Step 2: Install Dependencies**

**Double-click**: `install-dependencies.bat`

This will install the required packages (ws library).

---

### **Step 3: Setup Firewall**

**Right-click** `setup-firewall.bat` → **Run as administrator**

This opens port 8083 in Windows Firewall.

---

### **Step 4: Start Server**

**Double-click**: `start-server.bat`

You should see:
```
🚀 Rover WebRTC Cloud Server Started!
=====================================
Port: 8083
=====================================
```

**Keep this window open!** The server is running.

---

## 📱 Connect from Android

### **Find Your Public IP**

Visit: https://whatismyipaddress.com/

Example: `203.45.67.89`

### **Update Android App**

On your Android device:
```
Server URL: ws://YOUR_PUBLIC_IP:8083
```

Example: `ws://203.45.67.89:8083`

### **Test Connection**

1. Android: Turn OFF WiFi (use mobile data)
2. Tap "START STREAMING"
3. Should connect instantly! ⚡

---

## 🌐 Open Browser Dashboard

**On your PC**: http://localhost:8083

**On other devices**: http://YOUR_LOCAL_IP:8083

---

## 🔧 Troubleshooting

### **Issue: "Node.js is not installed"**

**Solution**: Install Node.js from https://nodejs.org/

---

### **Issue: "Cannot connect from Android"**

**Check**:
1. ✅ Server is running (start-server.bat window is open)
2. ✅ Firewall rule added (run setup-firewall.bat as admin)
3. ✅ Using correct public IP
4. ✅ Using `ws://` not `wss://`

**Test locally first**:
- Android on same WiFi
- Use local IP: `ws://192.168.x.x:8083`

---

### **Issue: "Port 8083 already in use"**

**Solution**: Change port in server.js (line 12):
```javascript
const PORT = process.env.PORT || 9000;  // Change to 9000
```

Then update firewall rule for new port.

---

### **Issue: Router blocks connection**

**Solution**: Setup port forwarding on your router

1. Login to router (usually 192.168.1.1)
2. Find "Port Forwarding" section
3. Add rule:
   - External Port: 8083
   - Internal IP: YOUR_PC_LOCAL_IP
   - Internal Port: 8083
   - Protocol: TCP
4. Save and restart router

---

## 🚀 Auto-Start on Windows Boot (Optional)

### **Method 1: Task Scheduler**

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Rover WebRTC Server"
4. Trigger: "When the computer starts"
5. Action: "Start a program"
6. Program: `C:\Windows\System32\cmd.exe`
7. Arguments: `/c "cd /d F:\Rover\RoverWebRTC\pc-receiver-cloud && start-server.bat"`
8. Finish

---

### **Method 2: Startup Folder**

1. Press `Win+R`
2. Type: `shell:startup`
3. Create shortcut to `start-server.bat`
4. Place shortcut in startup folder

---

## 📊 Server Management

### **Stop Server**

Press `Ctrl+C` in the server window

### **Restart Server**

1. Stop server (Ctrl+C)
2. Run `start-server.bat` again

### **View Logs**

All logs appear in the server window:
```
[Signaling] New client connected
[Signaling] Mobile client registered
[Signaling] Received: offer
```

---

## 🔒 Security Tips

### **1. Use Strong Router Password**

Change default router password to prevent unauthorized access.

### **2. Limit Port Forwarding**

Only forward port 8083, nothing else.

### **3. Monitor Connections**

Watch server logs for unexpected connections.

### **4. Add Authentication (Advanced)**

Edit server.js to add password protection (ask me if needed).

---

## 🎯 Expected Performance

### **Same Network**:
- Latency: 60-100ms ⚡
- Connection: Instant

### **Different Network** (with TURN):
- Latency: 80-150ms
- Connection: 1-2 seconds
- Very stable

---

## 💡 Tips

### **Keep PC Awake**

Prevent PC from sleeping:
1. Settings → System → Power & sleep
2. Set "Sleep" to "Never" (when plugged in)

### **Static Local IP**

Give your PC a static IP:
1. Settings → Network → Ethernet/WiFi → Properties
2. IP assignment: Manual
3. Set static IP (e.g., 192.168.1.100)

### **Check Server Status**

Visit: http://localhost:8083/health

Should show:
```json
{"status":"ok","clients":{"mobile":false,"pc":false}}
```

---

## 📞 Need Help?

**Common commands**:
```cmd
# Check if Node.js installed
node --version

# Check if server is running
netstat -ano | findstr :8083

# Kill process on port 8083
taskkill /F /PID <PID_NUMBER>

# Test local connection
curl http://localhost:8083/health
```

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] Dependencies installed (ran install-dependencies.bat)
- [ ] Firewall configured (ran setup-firewall.bat as admin)
- [ ] Server running (start-server.bat)
- [ ] Port forwarding setup (if needed)
- [ ] Android app updated with public IP
- [ ] Tested connection

---

**You're all set!** 🎉

