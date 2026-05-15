const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const URL = 'http://localhost:3000/linkedin-carousel-mindset-reset.html';
const OUTPUT_DIR = path.join(__dirname, 'carousel-export');
const SLIDE_COUNT = 5;
const SIZE = 1080;

async function exportCarousel() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Set viewport to exactly 1080x1080 with 1x scale for pixel-perfect capture
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });

  console.log('Loading carousel...');
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  // Hide navigation, instructions, and body padding — isolate just the carousel
  await page.evaluate(() => {
    const nav = document.querySelector('.nav-controls');
    const inst = document.querySelector('.instructions');
    if (nav) nav.style.display = 'none';
    if (inst) inst.style.display = 'none';

    // Remove body padding so viewport fills the screen
    document.body.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    // Make carousel wrapper fill the viewport exactly
    const wrapper = document.querySelector('.carousel-wrapper');
    if (wrapper) {
      wrapper.style.width = '1080px';
      wrapper.style.height = '1080px';
      wrapper.style.padding = '0';
      wrapper.style.margin = '0';
    }

    // Ensure the viewport is exactly 1080x1080
    const viewport = document.querySelector('.carousel-viewport');
    if (viewport) {
      viewport.style.width = '1080px';
      viewport.style.height = '1080px';
      viewport.style.borderRadius = '0';
      viewport.style.boxShadow = 'none';
    }

    // Make sure all slides have no transitions and only one is visible at a time
    const slides = document.querySelectorAll('.slide');
    slides.forEach(s => {
      s.style.transition = 'none';
      s.style.width = '1080px';
      s.style.height = '1080px';
    });
  });

  const pngFiles = [];

  for (let i = 0; i < SLIDE_COUNT; i++) {
    // Activate only this slide, hide all others completely
    await page.evaluate((index) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach((s, j) => {
        if (j === index) {
          s.classList.add('active');
          s.style.opacity = '1';
          s.style.display = 'flex';
          s.style.zIndex = '10';
        } else {
          s.classList.remove('active');
          s.style.opacity = '0';
          s.style.display = 'none';
          s.style.zIndex = '0';
        }
      });
    }, i);

    // Wait for rendering to settle
    await new Promise(r => setTimeout(r, 500));

    const filename = `slide-${String(i + 1).padStart(2, '0')}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Take a full-page screenshot clipped to exactly 1080x1080
    await page.screenshot({
      path: filepath,
      type: 'png',
      clip: { x: 0, y: 0, width: SIZE, height: SIZE }
    });

    pngFiles.push(filepath);
    console.log(`Exported ${filename}`);
  }

  // Build PDF — each page is 1080x1080 points with the image filling it exactly
  console.log('\nBuilding PDF...');
  const pdfDoc = await PDFDocument.create();

  for (const pngPath of pngFiles) {
    const pngBytes = fs.readFileSync(pngPath);
    const pngImage = await pdfDoc.embedPng(pngBytes);

    // Use the actual image dimensions for perfect mapping
    const imgWidth = pngImage.width;
    const imgHeight = pngImage.height;

    // Create page sized to the image
    const pdfPage = pdfDoc.addPage([imgWidth, imgHeight]);
    pdfPage.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: imgWidth,
      height: imgHeight,
    });
  }

  const pdfPath = path.join(OUTPUT_DIR, 'linkedin-carousel.pdf');
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfPath, pdfBytes);

  await browser.close();

  console.log(`\nDone! Files saved to: ${OUTPUT_DIR}`);
  console.log(`  - 12 PNG slides (1080x1080)`);
  console.log(`  - linkedin-carousel.pdf`);
  console.log(`\nTo post: LinkedIn > Start a post > Document icon > Upload the PDF`);
}

exportCarousel().catch(err => {
  console.error('Export failed:', err.message);
  process.exit(1);
});
