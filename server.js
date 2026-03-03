const express = require('express');
const { chromium } = require('playwright');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Trigger endpoint — called by Make.com
app.post('/trigger', async (req, res) => {
  const data = req.body;
  console.log('Primljeni podaci:', JSON.stringify(data, null, 2));

  // Add current date/time if not provided
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  data.arrival_date = data.arrival_date || `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}`;
  data.arrival_time = data.arrival_time || `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Respond immediately to Make — don't wait for browser
  res.json({ status: 'received', message: 'Pokretanje automatske prijave...' });

  // Run Playwright in background
  runPlaywright(data).catch(err => {
    console.error('Playwright greška:', err.message);
  });
});

async function runPlaywright(data) {
  let browser;
  try {
    console.log('Pokretanje browsera...');
    browser = await chromium.launch({
      headless: false, // false = vidljiv browser, true = nevidljiv
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 }
    });

    const page = await context.newPage();

    // Open the test form
    console.log(`Otvaranje forme: ${BASE_URL}`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Wait for form to load
    await page.waitForSelector('#ime');

    // Fill the form via JavaScript function
    await page.evaluate((formData) => {
      if (typeof fillForm === 'function') {
        fillForm(formData);
      }
    }, data);

    console.log('Forma popunjena uspešno!');

    // Wait a bit so user can see the filled form
    await page.waitForTimeout(2000);

    // Optional: take screenshot for debugging
    await page.screenshot({ path: '/tmp/screenshot.png' });
    console.log('Screenshot sačuvan: /tmp/screenshot.png');

    // Keep browser open for 5 minutes for manual review
    await page.waitForTimeout(5 * 60 * 1000);

  } catch (err) {
    console.error('Greška u Playwright-u:', err.message);
  } finally {
    if (browser) await browser.close();
  }
}

app.listen(PORT, () => {
  console.log(`Server pokrenut na portu ${PORT}`);
  console.log(`Test forma: ${BASE_URL}`);
  console.log(`Trigger endpoint: ${BASE_URL}/trigger`);
});
