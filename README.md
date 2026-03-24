# YT Scraper - YouTube Downloader

Node.js script untuk download video dan audio dari YouTube menggunakan API `hub.ytconvert.org`.

## 📋 Fitur

- ✅ Download video YouTube hingga **4K (2160p)**
- ✅ Download audio dengan berbagai format dan bitrate
- ✅ Auto-polling status hingga download siap
- ✅ CLI dan module export
- ✅ Output JSON bersih

---

## 🎵 Format Audio

| Format | Bitrate Options     | Default |
|--------|---------------------|---------|
| MP3    | 320k, 192k, 128k, 64k | 128k    |
| WAV    | 128k                | -       |
| M4A    | 128k                | -       |
| OGG    | 128k                | -       |
| Opus   | 128k                | -       |
| FLAC   | 128k                | -       |

---

## 🎬 Format Video

| Format | Kualitas Tersedia          |
|--------|----------------------------|
| MP4    | 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 2160p (4K) |
| WebM   | 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 2160p (4K) |
| MKV    | 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, 2160p (4K) |

---

## 💻 Penggunaan CLI

### Download Audio MP3 320kbps
```bash
node yt-scraper.js https://youtu.be/Jx5LKJCbswo --type audio --format mp3 --bitrate 320k
```

**Output:**
```json
{
  "status": "completed",
  "progress": 100,
  "title": "TRACK TITLE",
  "duration": 314,
  "downloadUrl": "https://vps-xxxxx.ytconvert.org/stream/xxx?token=xxx"
}
```

### Download Audio MP3 192kbps
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type audio --format mp3 --bitrate 192k
```

### Download Audio MP3 128kbps (Default)
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type audio --format mp3
```

### Download Audio MP3 64kbps
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type audio --format mp3 --bitrate 64k
```

### Download Audio WAV
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type audio --format wav
```

### Download Audio M4A
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type audio --format m4a
```

### Download Audio OGG
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type audio --format ogg
```

### Download Audio Opus
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type audio --format opus
```

### Download Audio FLAC
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type audio --format flac
```

### Download Video MP4 2160p (Default)
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ
```

### Download Video MP4 1080p
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type video --format mp4 --quality 1080p
```

### Download Video WebM 4K
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type video --format webm --quality 2160p
```

### Download Video MKV 720p
```bash
node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type video --format mkv --quality 720p
```

---

## 📖 Options

| Option      | Deskripsi                    | Default  | Contoh Nilai                    |
|-------------|------------------------------|----------|---------------------------------|
| `--type`    | Tipe download                | `video`  | `video`, `audio`                |
| `--format`  | Format output                | `mp4`    | `mp4`, `webm`, `mkv`, `mp3`, `wav`, `m4a`, `ogg`, `opus`, `flac` |
| `--quality` | Kualitas video               | `2160p`  | `144p`, `240p`, `360p`, `480p`, `720p`, `1080p`, `1440p`, `2160p` |
| `--bitrate` | Bitrate audio                | `128k`   | `320k`, `192k`, `128k`, `64k`   |

---

## 🔧 Penggunaan sebagai Module

```javascript
const { download, checkStatus, waitForDownload } = require('./yt-scraper');

(async () => {
    // Download audio MP3 320kbps
    const result = await download('https://youtu.be/LXb3EKWsInQ', {
        type: 'audio',
        format: 'mp3',
        bitrate: '320k'
    });
    
    // Wait hingga download siap
    const final = await waitForDownload(result.statusUrl);
    
    // Output JSON
    console.log(JSON.stringify(final, null, 2));
    // final.downloadUrl berisi URL download
})();
```

---

## 📥 Cara Download File

Setelah mendapat `downloadUrl` dari output JSON:

```bash
# Menggunakan curl
curl -L -o output.mp3 "https://vps-xxxxx.ytconvert.org/stream/xxx?token=xxx"

# Menggunakan wget
wget -O output.mp3 "https://vps-xxxxx.ytconvert.org/stream/xxx?token=xxx"
```

---

## ⚠️ Catatan

- Script ini menggunakan API dari `hub.ytconvert.org`
- Download video YouTube mungkin melanggar Terms of Service YouTube
- Gunakan hanya untuk konten yang Anda miliki atau memiliki izin untuk download
- Koneksi internet diperlukan untuk mengakses API
- Token download memiliki waktu kadaluarsa (segera gunakan setelah diterima)

---

## 📄 License

MIT
