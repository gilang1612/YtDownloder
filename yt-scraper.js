const https = require('https');
const zlib = require('zlib');

const API_HOST = 'hub.ytconvert.org';
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 16; ASUS_AI2401_A Build/BP2A.250605.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.135 Mobile Safari/537.36';

/**
 * Decompress response body based on content-encoding
 */
function decompress(body, encoding) {
    return new Promise((resolve, reject) => {
        if (!encoding) {
            resolve(body);
            return;
        }
        
        const enc = encoding.toLowerCase();
        if (enc.includes('zstd')) {
            // zstd not supported in Node.js built-in, return raw
            resolve(body);
            return;
        }
        if (enc.includes('br')) {
            zlib.brotliDecompress(body, (err, result) => {
                if (err) resolve(body);
                else resolve(result);
            });
            return;
        }
        if (enc.includes('gzip')) {
            zlib.gunzip(body, (err, result) => {
                if (err) resolve(body);
                else resolve(result);
            });
            return;
        }
        if (enc.includes('deflate')) {
            zlib.inflateRaw(body, (err, result) => {
                if (err) resolve(body);
                else resolve(result);
            });
            return;
        }
        resolve(body);
    });
}

/**
 * Make HTTPS POST request
 */
function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        const options = {
            hostname: API_HOST,
            path: path,
            method: 'POST',
            headers: {
                'Host': API_HOST,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': USER_AGENT,
                'Content-Length': Buffer.byteLength(postData),
                'Referer': 'https://snakeloader.com/',
                'Origin': 'https://snakeloader.com',
                'sec-ch-ua-platform': '"Windows"',
                'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'x-requested-with': 'mark.via.gp',
                'sec-fetch-site': 'cross-site',
                'sec-fetch-mode': 'cors',
                'sec-fetch-dest': 'empty',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'priority': 'u=1, i'
            }
        };

        const req = https.request(options, async (res) => {
            let chunks = [];
            const encoding = res.headers['content-encoding'];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', async () => {
                const body = Buffer.concat(chunks);
                try {
                    const decompressed = await decompress(body, encoding);
                    resolve(JSON.parse(decompressed.toString()));
                } catch (e) {
                    resolve({ raw: body.toString(), error: e.message });
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

/**
 * Make HTTPS GET request
 */
function getRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_HOST,
            path: path,
            method: 'GET',
            headers: {
                'Host': API_HOST,
                'Accept': 'application/json',
                'User-Agent': USER_AGENT,
                'accept-encoding': 'gzip, deflate, br'
            }
        };

        const req = https.request(options, async (res) => {
            let chunks = [];
            const encoding = res.headers['content-encoding'];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', async () => {
                const body = Buffer.concat(chunks);
                try {
                    const decompressed = await decompress(body, encoding);
                    resolve(JSON.parse(decompressed.toString()));
                } catch (e) {
                    resolve({ raw: body.toString(), error: e.message });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * Download YouTube video/audio
 * @param {string} url - YouTube URL
 * @param {object} options - Download options
 * @returns {Promise<object>}
 */
async function download(url, options = {}) {
    const {
        type = 'video',      // 'video' or 'audio'
        format = 'mp4',      // 'mp4' for video, 'mp3' for audio
        quality = '1080p',   // '2160p', '1440p', '1080p', '720p', '480p', '360p'
        bitrate = '128k'     // '320k', '256k', '128k'
    } = options;

    const payload = {
        url: url,
        os: 'android',
        output: {
            type: type,
            format: format,
            quality: type === 'video' ? quality : undefined
        },
        audio: {
            bitrate: bitrate
        }
    };

    // Remove undefined fields
    if (type === 'audio') {
        delete payload.output.quality;
    }

    const result = await postRequest('/api/download', payload);
    return result;
}

/**
 * Check download status
 * @param {string} statusUrl - Status URL from download response
 * @returns {Promise<object>}
 */
async function checkStatus(statusUrl) {
    const url = new URL(statusUrl);
    const path = url.pathname + url.search;
    
    // Extract domain from statusUrl
    const domain = url.hostname;
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: domain,
            path: path,
            method: 'GET',
            headers: {
                'Host': domain,
                'Accept': 'application/json',
                'User-Agent': USER_AGENT,
                'accept-encoding': 'gzip, deflate, br'
            }
        };

        const req = https.request(options, async (res) => {
            let chunks = [];
            const encoding = res.headers['content-encoding'];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', async () => {
                const body = Buffer.concat(chunks);
                try {
                    const decompressed = await decompress(body, encoding);
                    resolve(JSON.parse(decompressed.toString()));
                } catch (e) {
                    resolve({ raw: body.toString(), error: e.message });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * Poll status until download is ready
 * @param {string} statusUrl - Status URL
 * @param {number} maxAttempts - Maximum polling attempts
 * @param {number} interval - Polling interval in ms
 * @returns {Promise<object>}
 */
async function waitForDownload(statusUrl, maxAttempts = 60, interval = 3000) {
    for (let i = 0; i < maxAttempts; i++) {
        const status = await checkStatus(statusUrl);
        
        if (status.status === 'finished' || status.status === 'completed' || status.downloadUrl || status.download?.url) {
            return status;
        }
        
        if (status.status === 'error') {
            throw new Error(`Download error: ${status.message || 'Unknown error'}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('Download timeout - took too long to process');
}

// CLI usage
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node yt-scraper.js <youtube_url> [options]');
        console.log('');
        console.log('Options:');
        console.log('  --type <video|audio>   Download type (default: video)');
        console.log('  --quality <quality>    Video quality: 2160p, 1440p, 1080p, 720p, 480p, 360p');
        console.log('  --bitrate <bitrate>    Audio bitrate: 320k, 256k, 128k');
        console.log('  --format <format>      Output format: mp4, mp3');
        console.log('');
        console.log('Examples:');
        console.log('  node yt-scraper.js https://youtu.be/LXb3EKWsInQ');
        console.log('  node yt-scraper.js https://youtu.be/LXb3EKWsInQ --type audio --bitrate 320k');
        console.log('  node yt-scraper.js https://youtu.be/LXb3EKWsInQ --quality 1080p');
        process.exit(1);
    }

    const url = args.find(arg => !arg.startsWith('--'));
    
    // Parse options
    const options = {
        type: 'video',
        quality: '2160p',
        bitrate: '128k',
        format: 'mp4'
    };
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--type' && args[i + 1]) {
            options.type = args[++i];
        } else if (args[i] === '--quality' && args[i + 1]) {
            options.quality = args[++i];
        } else if (args[i] === '--bitrate' && args[i + 1]) {
            options.bitrate = args[++i];
        } else if (args[i] === '--format' && args[i + 1]) {
            options.format = args[++i];
        }
    }

    try {
        const result = await download(url, options);
        
        if (result.statusUrl) {
            const finalStatus = await waitForDownload(result.statusUrl);
            console.log(JSON.stringify(finalStatus, null, 2));
        } else {
            console.log(JSON.stringify(result, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Export for module usage
module.exports = { download, checkStatus, waitForDownload };

// Run if called directly
if (require.main === module) {
    main();
}
