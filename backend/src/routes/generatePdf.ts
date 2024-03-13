import express from "express";
import puppeteer from "puppeteer";

const app = express();
const router = express.Router();

router.post('/generate-pdf', async (req, res) => {
  try {
    console.log('Received request to generate PDF');
    
    const { htmlContent } = req.body;
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Log console messages
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' }); // Wait until no more than 0 network connections for at least 500 ms.
    await page.emulateMediaType('screen');
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });
    
    await browser.close();
    
    console.log('Exiting PDF generation process');
    
    res.setHeader('Content-Disposition', 'attachment; filename="mypdf.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});


export default router;
