const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const URL = 'http://localhost:3000/linkedin-carousel-pretty-face.html';
const OUTPUT_DIR = path.join(__dirname, 'carousel-export-pretty-face');
const SLIDE_COUNT = 5;
const SIZE = 1080;

async function exportCarousel() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });

  console.log('Loading carousel...');
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });

  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const nav = document.querySelector('.nav-controls');
    const inst = document.querySelector('.instructions');
    if (nav) nav.style.display = 'none';
    if (inst) inst.style.display = 'none';

    document.body.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    const wrapper = document.querySelector('.carousel-wrapper');
    if (wrapper) { wrapper.style.width = '1080px'; wrapper.style.height = '1080px'; wrapper.style.padding = '0'; wrapper.style.margin = '0'; }

    const viewport = document.querySelector('.carousel-viewport');
    if (viewport) { viewport.style.width = '1080px'; viewport.style.height = '1080px'; viewport.style.borderRadius = '0'; viewport.style.boxShadow = 'none'; }

    document.querySelectorAll('.slide').forEach(s => {
      s.style.transition = 'none';
      s.style.width = '1080px';
      s.style.height = '1080px';
    });
  });

  const pngFiles = [];

  for (let i = 0; i < SLIDE_COUNT; i++) {
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

    await new Promise(r => setTimeout(r, 500));

    const filename = `slide-${String(i + 1).padStart(2, '0')}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    await page.screenshot({
      path: filepath,
      type: 'png',
      clip: { x: 0, y: 0, width: SIZE, height: SIZE }
    });

    pngFiles.push(filepath);
    console.log(`Exported ${filename}`);
  }

  console.log('\nBuilding PDF...');
  const pdfDoc = await PDFDocument.create();

  for (const pngPath of pngFiles) {
    const pngBytes = fs.readFileSync(pngPath);
    const pngImage = await pdfDoc.embedPng(pngBytes);
    const imgWidth = pngImage.width;
    const imgHeight = pngImage.height;
    const pdfPage = pdfDoc.addPage([imgWidth, imgHeight]);
    pdfPage.drawImage(pngImage, { x: 0, y: 0, width: imgWidth, height: imgHeight });
  }

  const pdfPath = path.join(OUTPUT_DIR, 'linkedin-carousel.pdf');
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfPath, pdfBytes);

  await browser.close();

  console.log(`\nDone! Files saved to: ${OUTPUT_DIR}`);
  console.log(`  - 5 PNG slides (1080x1080)`);
  console.log(`  - linkedin-carousel.pdf`);
  console.log(`\nTo post: LinkedIn > Start a post > Document icon > Upload the PDF`);
}

exportCarousel().catch(err => {
  console.error('Export failed:', err.message);
  process.exit(1);
});
