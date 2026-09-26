const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const DIST_DIR = path.join(__dirname, '..', 'dist-web');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'screenshots');
const PORT = 3333;
const WIDTH = 1080;
const HEIGHT = 1920;

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Servidor HTTP simple para servir dist-web
function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
      // Normalize path
      filePath = path.normalize(filePath);
      // Security: prevent directory traversal
      if (!filePath.startsWith(DIST_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      // Handle directory requests
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      // MIME types
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon',
        '.svg': 'image/svg+xml',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      if (fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      } else {
        // SPA fallback
        const indexPath = path.join(DIST_DIR, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          fs.createReadStream(indexPath).pipe(res);
        } else {
          res.writeHead(404);
          res.end('Not found');
        }
      }
    });
    server.listen(PORT, () => {
      console.log(`📡 Servidor en http://localhost:${PORT}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

async function captureScreenshot(page, name, waitForSelector = null, extraWait = 1000) {
  if (waitForSelector) {
    await page.waitForSelector(waitForSelector, { timeout: 10000 }).catch(() => {});
  }
  await page.waitForTimeout(extraWait);
  const filePath = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`📸 ${name}.png`);
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  try {
    // 1. Login screen
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    await captureScreenshot(page, '01-login', 'text=NeuroPaso', 2000);

    // Try to find and interact with elements to navigate
    // The app uses React Navigation - we'll try to trigger navigation via URL or button clicks

    // 2. Home screen (after login - might need to mock auth or skip to home)
    // Since we can't easily login, we'll try to navigate directly to home if possible
    // The Expo web app might have deep links or we can manipulate localStorage

    // Let's try to access the home screen directly by checking what routes exist
    // First, let's see what the app renders

    // Wait for app to hydrate
    await page.waitForTimeout(3000);

    // Try to click "Empezar" or similar to proceed
    const startBtn = page.locator('button:has-text("EMPEZAR"), button:has-text("Empezar"), button:has-text("Iniciar"), button:has-text("Comenzar")').first();
    if (await startBtn.count() > 0) {
      await startBtn.click();
      await page.waitForTimeout(1500);
    }

    await captureScreenshot(page, '02-home', null, 2000);

    // Try to open Add Task modal
    const addBtn = page.locator('button:has-text("+"), button:has-text("Añadir"), button:has-text("Agregar"), [aria-label*="add" i], [aria-label*="añadir" i]').first();
    if (await addBtn.count() > 0) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, '03-add-task', null, 1000);
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Try to open Settings
    const settingsBtn = page.locator('button:has-text("⚙"), button:has-text("Configuración"), [aria-label*="settings" i], [aria-label*="configuracion" i]').first();
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, '04-settings', null, 1000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Try Stats
    const statsBtn = page.locator('button:has-text("📊"), button:has-text("Estadísticas"), button:has-text("Stats"), [aria-label*="stats" i]').first();
    if (await statsBtn.count() > 0) {
      await statsBtn.click();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, '05-stats', null, 1000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Try Mood tracker
    const moodBtn = page.locator('button:has-text("😊"), button:has-text("Ánimo"), button:has-text("Mood"), [aria-label*="mood" i]').first();
    if (await moodBtn.count() > 0) {
      await moodBtn.click();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, '06-mood', null, 1000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Try Shutdown ritual
    const shutdownBtn = page.locator('button:has-text("🌙"), button:has-text("Cierre"), button:has-text("Shutdown"), [aria-label*="shutdown" i]').first();
    if (await shutdownBtn.count() > 0) {
      await shutdownBtn.click();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, '07-shutdown', null, 1000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Timer running (try to start a timer)
    const timerBtn = page.locator('button:has-text("▶"), button:has-text("Iniciar"), button:has-text("Start")').first();
    if (await timerBtn.count() > 0) {
      await timerBtn.click();
      await page.waitForTimeout(1500);
      await captureScreenshot(page, '08-timer-running', null, 1000);
    }

    // Try AI breakdown (if there's a task with AI button)
    const aiBtn = page.locator('button:has-text("🤖"), button:has-text("IA"), button:has-text("Desglosar"), [aria-label*="ai" i]').first();
    if (await aiBtn.count() > 0) {
      await aiBtn.click();
      await page.waitForTimeout(2000);
      await captureScreenshot(page, '09-ai-breakdown', null, 1500);
    }

    console.log('\n✅ Capturas completadas en:', OUT_DIR);
    const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png'));
    files.forEach(f => {
      const stats = fs.statSync(path.join(OUT_DIR, f));
      console.log(`  ${f} - ${(stats.size/1024).toFixed(1)} KB`);
    });

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
    server.close();
  }
}

run();