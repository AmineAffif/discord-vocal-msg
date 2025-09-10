# Discord Voice Messages Extension

## 🎯 Problem

Discord doesn't have a built-in voice message feature like WhatsApp or Telegram.

This creates friction and breaks the conversation flow.

## 💡 Solution

A Chrome extension that adds a **voice message button** directly to Discord's chat interface, allowing users to:

- Record voice messages with one click
- Preview and control playback before sending
- Send voice messages instantly with proper audio player

## ✨ Features

### 🎙️ **Voice Recording**

- One-click recording with microphone access
- Automatic format detection (M4A/WebM for best compatibility)

### 🎵 **Audio Preview & Controls**

- **Play/Pause**: Control playback before sending
- **Timeline Navigation**: Click anywhere to jump to specific time
- **Drag & Drop**: Drag the progress thumb for precise control
- **Time Display**: Shows current time and total duration
- **Visual Progress**: Real-time progress bar with thumb indicator

### 🚀 **Smart Sending**

- Preview before sending (no accidental sends)
- Automatic file attachment to Discord
- Instant sending with proper audio player
- Clean interface integration

### 🎨 **Discord Integration**

- Native Discord button styling
- Positioned with other Discord buttons (emoji, apps)
- Maintains focus during recording
- Works across all Discord conversations

## 🚀 How to Use

### Installation

1. Download the extension files
2. Open Chrome Extensions (`chrome://extensions/`)
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder

### Recording Voice Messages

#### Step 1: Start Recording

![Screenshot: Discord chat with voice button highlighted]

- Click the **🎙️ microphone button** in Discord's chat input area
- The button turns red and shows a stop icon (⏹️)
- Start speaking into your microphone

#### Step 2: Stop Recording

![Screenshot: Voice preview interface showing controls]

- Click the **⏹️ stop button** to end recording
- The preview interface appears with your recorded audio

#### Step 3: Preview & Control

![Screenshot: Audio controls with play button and timeline]

- **▶️ Play/Pause**: Click to listen to your recording
- **Timeline**: Click anywhere on the progress bar to jump to that time
- **Drag**: Drag the white circle to scrub through the audio
- **Time**: See current position and total duration

#### Step 4: Send or Cancel

![Screenshot: Send and delete buttons in preview]

- **🗑️ Delete**: Remove the recording and start over
- **📤 Send**: Send the voice message to Discord
- The message appears with a proper audio player

### Navigation Tips

- **Click anywhere** in the controls area to navigate
- **Drag the thumb** for precise control
- **Hover effects** provide visual feedback
- **Keyboard shortcuts** work with Discord's existing shortcuts

## 🔧 Technical Details

### Browser Compatibility

- Chrome/Chromium browsers
- Requires microphone permissions
- Works with Discord web app

## 🎨 Design Philosophy

The extension follows Discord's design language:

- **Colors**: Discord's blue (#5865f2) and gray palette
- **Typography**: Consistent with Discord's font system
- **Interactions**: Familiar hover and click behaviors
- **Positioning**: Integrated with existing Discord buttons

## 🔒 Privacy & Security

- **Local Processing**: All audio processing happens locally
- **No Data Collection**: No audio data is sent to external servers
- **Discord Integration**: Uses Discord's existing file upload system
- **Permissions**: Only requests microphone access when needed

## 🐛 Troubleshooting

### Microphone Not Working

- Check browser microphone permissions
- Try refreshing Discord

### Audio Not Playing

- Check if audio is muted in browser
- Verify Discord's audio settings

### Button Not Appearing

- Refresh Discord page
- Check if extension is enabled
- Verify you're on Discord web (not desktop app)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

**Made with ❤️ for the Discord community**
