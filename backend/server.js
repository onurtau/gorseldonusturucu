const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const geoip = require('geoip-lite');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration with multiple origins
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Multer configuration for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
  }
});

// Cleanup function for temporary files
async function cleanupFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running' });
});

// POST /api/convert - Format conversion
app.post('/api/convert', upload.single('file'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    inputPath = req.file.path;
    const options = JSON.parse(req.body.options || '{}');
    const { format, quality, width, height } = options;

    if (!format) {
      await cleanupFile(inputPath);
      return res.status(400).json({ error: 'Format is required' });
    }

    // Set output path
    outputPath = `uploads/converted-${Date.now()}.${format}`;

    // Sharp conversion pipeline
    let pipeline = sharp(inputPath);

    // Get image metadata to detect color space
    const metadata = await pipeline.metadata();

    // CMYK to RGB conversion for formats that don't support CMYK
    // AVIF, WebP, PNG require RGB color space
    const rgbOnlyFormats = ['avif', 'webp', 'png', 'gif'];
    if (metadata.space === 'cmyk' && rgbOnlyFormats.includes(format.toLowerCase())) {
      console.log(`[CONVERT] CMYK detected, converting to RGB for ${format} format`);
      pipeline = pipeline.toColorspace('srgb');
    }

    // Resize if dimensions provided
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Format-specific options
    const formatOptions = {};
    if (quality) {
      formatOptions.quality = parseInt(quality);
    }

    // Convert
    await pipeline.toFormat(format, formatOptions).toFile(outputPath);

    // Read the converted file
    const fileBuffer = await fs.readFile(outputPath);
    
    // Send file
    res.set({
      'Content-Type': `image/${format}`,
      'Content-Disposition': `attachment; filename="converted.${format}"`
    });
    res.send(fileBuffer);

    // Cleanup
    await cleanupFile(inputPath);
    await cleanupFile(outputPath);

  } catch (error) {
    console.error('Conversion error:', error);
    if (inputPath) await cleanupFile(inputPath);
    if (outputPath) await cleanupFile(outputPath);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/resize - Image resizing
app.post('/api/resize', upload.single('file'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    inputPath = req.file.path;
    const options = JSON.parse(req.body.options || '{}');
    const { targetSize, format, quality } = options;

    if (!targetSize) {
      await cleanupFile(inputPath);
      return res.status(400).json({ error: 'Target size (KB) is required' });
    }

    const outputFormat = format || 'jpg';
    outputPath = `uploads/resized-${Date.now()}.${outputFormat}`;

    // Target size in bytes
    const targetSizeBytes = parseInt(targetSize) * 1024;
    
    // Binary search for optimal quality
    let minQuality = 1;
    let maxQuality = 100;
    let bestQuality = 90;
    let attempts = 0;
    const maxAttempts = 10;

    while (minQuality <= maxQuality && attempts < maxAttempts) {
      const testQuality = Math.floor((minQuality + maxQuality) / 2);
      
      const testBuffer = await sharp(inputPath)
        .toFormat(outputFormat, { quality: testQuality })
        .toBuffer();

      if (testBuffer.length <= targetSizeBytes) {
        bestQuality = testQuality;
        minQuality = testQuality + 1;
      } else {
        maxQuality = testQuality - 1;
      }
      
      attempts++;
    }

    // Create final file with best quality
    await sharp(inputPath)
      .toFormat(outputFormat, { quality: bestQuality })
      .toFile(outputPath);

    const fileBuffer = await fs.readFile(outputPath);
    
    res.set({
      'Content-Type': `image/${outputFormat}`,
      'Content-Disposition': `attachment; filename="resized.${outputFormat}"`
    });
    res.send(fileBuffer);

    await cleanupFile(inputPath);
    await cleanupFile(outputPath);

  } catch (error) {
    console.error('Resize error:', error);
    if (inputPath) await cleanupFile(inputPath);
    if (outputPath) await cleanupFile(outputPath);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/watermark - Add watermark
app.post('/api/watermark', upload.single('file'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    inputPath = req.file.path;
    const options = JSON.parse(req.body.options || '{}');
    const { 
      text, 
      position, 
      opacity, 
      fontSizePercent, 
      fontFamily, 
      color, 
      shadow,
      tileEnabled,
      tilePattern 
    } = options;

    if (!text) {
      await cleanupFile(inputPath);
      return res.status(400).json({ error: 'Watermark text is required' });
    }

    const outputFormat = options.format || 'png';
    outputPath = `uploads/watermarked-${Date.now()}.${outputFormat}`;

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Calculate font size (percentage of width)
    const fontSize = Math.floor(metadata.width * (fontSizePercent || 3) / 100);
    const watermarkOpacity = opacity || 0.5;
    const watermarkColor = color || '#808080';
    const watermarkFont = fontFamily || 'Impact';

    let watermarkBuffer;

    // Tile mode
    if (tileEnabled) {
      const pattern = tilePattern || 'diagonal';
      const spacing = fontSize * 4;
      const watermarks = [];

      // Calculate tile positions based on pattern
      let positions = [];
      
      switch (pattern) {
        case 'diagonal':
          // Diagonal from top-left to bottom-right
          for (let y = -spacing; y < metadata.height + spacing; y += spacing) {
            for (let x = -spacing; x < metadata.width + spacing; x += spacing) {
              positions.push({ x, y });
            }
          }
          break;
        
        case 'diagonal-reverse':
          // Diagonal from top-right to bottom-left
          for (let y = -spacing; y < metadata.height + spacing; y += spacing) {
            for (let x = metadata.width + spacing; x > -spacing; x -= spacing) {
              positions.push({ x, y });
            }
          }
          break;
        
        case 'grid':
          // Regular grid
          const gridSpacing = spacing * 0.7;
          for (let y = gridSpacing / 2; y < metadata.height; y += gridSpacing) {
            for (let x = gridSpacing / 2; x < metadata.width; x += gridSpacing) {
              positions.push({ x, y });
            }
          }
          break;
        
        case 'dense':
          // Dense pattern
          const denseSpacing = spacing * 0.5;
          for (let y = 0; y < metadata.height; y += denseSpacing) {
            for (let x = 0; x < metadata.width; x += denseSpacing) {
              positions.push({ x, y });
            }
          }
          break;
      }

      // Create SVG with multiple text elements
      const textElements = positions.map(pos => {
        const shadowFilter = shadow ? `filter="url(#shadow)"` : '';
        return `<text x="${pos.x}" y="${pos.y}" 
                      font-size="${fontSize}" 
                      font-family="${watermarkFont}"
                      fill="${watermarkColor}"
                      opacity="${watermarkOpacity}"
                      transform="rotate(-45 ${pos.x} ${pos.y})"
                      ${shadowFilter}>
                  ${text}
                </text>`;
      }).join('\n');

      const shadowDef = shadow ? `
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="2" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      ` : '';

      const svgWatermark = `
        <svg width="${metadata.width}" height="${metadata.height}">
          ${shadowDef}
          ${textElements}
        </svg>
      `;

      watermarkBuffer = Buffer.from(svgWatermark);

    } else {
      // Single watermark
      const positions = {
        'top-left': { x: '5%', y: '10%', anchor: 'start' },
        'top-right': { x: '95%', y: '10%', anchor: 'end' },
        'bottom-left': { x: '5%', y: '95%', anchor: 'start' },
        'bottom-right': { x: '95%', y: '95%', anchor: 'end' },
        'center': { x: '50%', y: '50%', anchor: 'middle' }
      };

      const pos = positions[position] || positions['bottom-right'];
      
      const shadowDef = shadow ? `
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.8"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      ` : '';

      const shadowFilter = shadow ? `filter="url(#shadow)"` : '';

      const svgWatermark = `
        <svg width="${metadata.width}" height="${metadata.height}">
          ${shadowDef}
          <text x="${pos.x}" y="${pos.y}" 
                font-size="${fontSize}" 
                font-family="${watermarkFont}"
                fill="${watermarkColor}"
                opacity="${watermarkOpacity}"
                text-anchor="${pos.anchor}"
                dominant-baseline="middle"
                ${shadowFilter}>
            ${text}
          </text>
        </svg>
      `;

      watermarkBuffer = Buffer.from(svgWatermark);
    }

    // Apply watermark
    await image
      .composite([{
        input: watermarkBuffer,
        gravity: 'northwest'
      }])
      .toFormat(outputFormat)
      .toFile(outputPath);

    const fileBuffer = await fs.readFile(outputPath);
    
    res.set({
      'Content-Type': `image/${outputFormat}`,
      'Content-Disposition': `attachment; filename="watermarked.${outputFormat}"`
    });
    res.send(fileBuffer);

    await cleanupFile(inputPath);
    await cleanupFile(outputPath);

  } catch (error) {
    console.error('Watermark error:', error);
    if (inputPath) await cleanupFile(inputPath);
    if (outputPath) await cleanupFile(outputPath);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/colorspace - Color space conversion
app.post('/api/colorspace', upload.single('file'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    inputPath = req.file.path;
    const options = JSON.parse(req.body.options || '{}');
    const { colorspace, format } = options;

    if (!colorspace || !['rgb', 'cmyk'].includes(colorspace)) {
      await cleanupFile(inputPath);
      return res.status(400).json({ error: 'Colorspace must be "rgb" or "cmyk"' });
    }

    // CMYK requires TIFF or JPEG format
    const outputFormat = colorspace === 'cmyk' ? 'tiff' : (format || 'png');
    outputPath = `uploads/colorspace-${Date.now()}.${outputFormat}`;

    let pipeline = sharp(inputPath);

    // Apply colorspace conversion
    if (colorspace === 'rgb') {
      pipeline = pipeline.toColorspace('srgb');
    } else if (colorspace === 'cmyk') {
      pipeline = pipeline.toColorspace('cmyk');
    }

    await pipeline.toFormat(outputFormat).toFile(outputPath);

    const fileBuffer = await fs.readFile(outputPath);
    
    res.set({
      'Content-Type': `image/${outputFormat}`,
      'Content-Disposition': `attachment; filename="colorspace.${outputFormat}"`
    });
    res.send(fileBuffer);

    await cleanupFile(inputPath);
    await cleanupFile(outputPath);

  } catch (error) {
    console.error('Colorspace error:', error);
    if (inputPath) await cleanupFile(inputPath);
    if (outputPath) await cleanupFile(outputPath);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/all-in-one - Combined operations
app.post('/api/all-in-one', upload.single('file'), async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    inputPath = req.file.path;
    const options = JSON.parse(req.body.options || '{}');
    const { 
      outputFormat,
      quality,
      targetSize,
      convertColorSpace,
      preserveMetadata,
      watermark
    } = options;

    const finalFormat = outputFormat || 'jpg';
    outputPath = `uploads/processed-${Date.now()}.${finalFormat}`;

    let pipeline = sharp(inputPath);

    // 1. Color space conversion (if requested)
    if (convertColorSpace) {
      if (convertColorSpace === 'rgb') {
        pipeline = pipeline.toColorspace('srgb');
      } else if (convertColorSpace === 'cmyk') {
        pipeline = pipeline.toColorspace('cmyk');
      }
    }

    // 2. Handle targetSize with binary search
    let finalQuality = quality || 90;
    let intermediateBuffer;

    if (targetSize) {
      const targetSizeBytes = parseInt(targetSize) * 1024;
      let minQuality = 1;
      let maxQuality = 100;
      let attempts = 0;
      const maxAttempts = 10;

      while (minQuality <= maxQuality && attempts < maxAttempts) {
        const testQuality = Math.floor((minQuality + maxQuality) / 2);
        
        const testBuffer = await pipeline
          .toFormat(finalFormat, { quality: testQuality })
          .toBuffer();

        if (testBuffer.length <= targetSizeBytes) {
          finalQuality = testQuality;
          minQuality = testQuality + 1;
          intermediateBuffer = testBuffer;
        } else {
          maxQuality = testQuality - 1;
        }
        
        attempts++;
      }

      // Use intermediate buffer if we have it
      if (intermediateBuffer) {
        pipeline = sharp(intermediateBuffer);
      }
    } else {
      // No targetSize, convert with specified quality
      intermediateBuffer = await pipeline
        .toFormat(finalFormat, { quality: finalQuality })
        .toBuffer();
      
      pipeline = sharp(intermediateBuffer);
    }

    // 3. Add watermark (if requested)
    if (watermark && watermark.enabled && watermark.text) {
      const metadata = await pipeline.metadata();
      const fontSize = Math.floor(metadata.width * (watermark.fontSizePercent || 3) / 100);
      const watermarkOpacity = watermark.opacity || 0.5;
      const watermarkColor = watermark.color || '#808080';
      const watermarkFont = watermark.fontFamily || 'Impact';

      let watermarkBuffer;

      // Tile mode
      if (watermark.tileEnabled) {
        const pattern = watermark.tilePattern || 'diagonal';
        const spacing = fontSize * 4;
        let positions = [];
        
        switch (pattern) {
          case 'diagonal':
            for (let y = -spacing; y < metadata.height + spacing; y += spacing) {
              for (let x = -spacing; x < metadata.width + spacing; x += spacing) {
                positions.push({ x, y });
              }
            }
            break;
          
          case 'diagonal-reverse':
            for (let y = -spacing; y < metadata.height + spacing; y += spacing) {
              for (let x = metadata.width + spacing; x > -spacing; x -= spacing) {
                positions.push({ x, y });
              }
            }
            break;
          
          case 'grid':
            const gridSpacing = spacing * 0.7;
            for (let y = gridSpacing / 2; y < metadata.height; y += gridSpacing) {
              for (let x = gridSpacing / 2; x < metadata.width; x += gridSpacing) {
                positions.push({ x, y });
              }
            }
            break;
          
          case 'dense':
            const denseSpacing = spacing * 0.5;
            for (let y = 0; y < metadata.height; y += denseSpacing) {
              for (let x = 0; x < metadata.width; x += denseSpacing) {
                positions.push({ x, y });
              }
            }
            break;
        }

        const textElements = positions.map(pos => {
          const shadowFilter = watermark.shadow ? `filter="url(#shadow)"` : '';
          return `<text x="${pos.x}" y="${pos.y}" 
                        font-size="${fontSize}" 
                        font-family="${watermarkFont}"
                        fill="${watermarkColor}"
                        opacity="${watermarkOpacity}"
                        transform="rotate(-45 ${pos.x} ${pos.y})"
                        ${shadowFilter}>
                    ${watermark.text}
                  </text>`;
        }).join('\n');

        const shadowDef = watermark.shadow ? `
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="2" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        ` : '';

        const svgWatermark = `
          <svg width="${metadata.width}" height="${metadata.height}">
            ${shadowDef}
            ${textElements}
          </svg>
        `;

        watermarkBuffer = Buffer.from(svgWatermark);

      } else {
        // Single watermark
        const positions = {
          'top-left': { x: '5%', y: '10%', anchor: 'start' },
          'top-right': { x: '95%', y: '10%', anchor: 'end' },
          'bottom-left': { x: '5%', y: '95%', anchor: 'start' },
          'bottom-right': { x: '95%', y: '95%', anchor: 'end' },
          'center': { x: '50%', y: '50%', anchor: 'middle' }
        };

        const pos = positions[watermark.position] || positions['bottom-right'];
        
        const shadowDef = watermark.shadow ? `
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="2" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.8"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        ` : '';

        const shadowFilter = watermark.shadow ? `filter="url(#shadow)"` : '';

        const svgWatermark = `
          <svg width="${metadata.width}" height="${metadata.height}">
            ${shadowDef}
            <text x="${pos.x}" y="${pos.y}" 
                  font-size="${fontSize}" 
                  font-family="${watermarkFont}"
                  fill="${watermarkColor}"
                  opacity="${watermarkOpacity}"
                  text-anchor="${pos.anchor}"
                  dominant-baseline="middle"
                  ${shadowFilter}>
              ${watermark.text}
            </text>
          </svg>
        `;

        watermarkBuffer = Buffer.from(svgWatermark);
      }

      // Apply watermark
      pipeline = pipeline.composite([{
        input: watermarkBuffer,
        gravity: 'northwest'
      }]);
    }

    // 4. Final output with metadata handling
    if (!preserveMetadata) {
      pipeline = pipeline.withMetadata({});
    }

    await pipeline.toFile(outputPath);

    const fileBuffer = await fs.readFile(outputPath);
    
    res.set({
      'Content-Type': `image/${finalFormat}`,
      'Content-Disposition': `attachment; filename="processed.${finalFormat}"`
    });
    res.send(fileBuffer);

    await cleanupFile(inputPath);
    await cleanupFile(outputPath);

  } catch (error) {
    console.error('All-in-one processing error:', error);
    if (inputPath) await cleanupFile(inputPath);
    if (outputPath) await cleanupFile(outputPath);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// PAYMENT & SUBSCRIPTION ENDPOINTS
// =============================================================================

// European countries list (EU + EEA + Switzerland + UK)
const EUROPEAN_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'NO', 'IS',
  'LI', 'CH', 'AL', 'AD', 'MC', 'SM', 'VA', 'ME', 'RS', 'MK',
  'BA', 'XK', 'MD', 'BY', 'UA', 'GE', 'AM', 'AZ'
];

// Pricing configuration
const PRICING_CONFIG = {
  turkey: {
    amount: 11900, // ₺119.00 (in cents)
    currency: 'try',
    symbol: '₺',
    displayAmount: '119',
    priceId: process.env.STRIPE_PRICE_ID_TURKEY || 'price_turkey_placeholder'
  },
  europe: {
    amount: 300, // €3.00 (in cents)
    currency: 'eur',
    symbol: '€',
    displayAmount: '3',
    priceId: process.env.STRIPE_PRICE_ID_EUROPE || 'price_europe_placeholder'
  },
  global: {
    amount: 300, // $3.00 (in cents)
    currency: 'usd',
    symbol: '$',
    displayAmount: '3',
    priceId: process.env.STRIPE_PRICE_ID_GLOBAL || 'price_global_placeholder'
  }
};

// Detect user region from IP
function detectRegion(ip) {
  // Handle localhost and private IPs
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'global'; // Default for development
  }

  const geo = geoip.lookup(ip);
  
  if (!geo || !geo.country) {
    return 'global';
  }

  const countryCode = geo.country;

  if (countryCode === 'TR') {
    return 'turkey';
  }

  if (EUROPEAN_COUNTRIES.includes(countryCode)) {
    return 'europe';
  }

  return 'global';
}

// Get user's real IP (handles proxies)
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress;
}

// GET /api/detect-location - Detect user location and pricing
app.get('/api/detect-location', (req, res) => {
  try {
    const ip = getClientIp(req);
    const region = detectRegion(ip);
    const pricing = PRICING_CONFIG[region];

    res.json({
      region,
      ip: ip === '::1' || ip === '127.0.0.1' ? 'localhost' : ip,
      pricing: {
        amount: pricing.displayAmount,
        currency: pricing.currency,
        symbol: pricing.symbol,
        formatted: `${pricing.symbol}${pricing.displayAmount}`
      }
    });
  } catch (error) {
    console.error('Location detection error:', error);
    res.status(500).json({ error: 'Failed to detect location' });
  }
});

// POST /api/create-checkout-session - Create Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId, userEmail } = req.body;
    const ip = getClientIp(req);
    const region = detectRegion(ip);
    const pricing = PRICING_CONFIG[region];

    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: pricing.priceId,
        quantity: 1,
      }],
      customer_email: userEmail,
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          userId: userId,
          region: region
        }
      },
      metadata: {
        userId: userId,
        region: region,
        ip: ip
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
    });

    res.json({
      sessionId: session.id,
      url: session.url,
      region,
      pricing: {
        amount: pricing.displayAmount,
        currency: pricing.currency,
        symbol: pricing.symbol
      }
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/verify-payment - Verify payment and activate subscription
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const subscription = session.subscription;

    res.json({
      success: true,
      userId: session.metadata.userId,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/stripe-webhook - Handle Stripe webhooks
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      console.log('Subscription updated:', subscription.id, subscription.status);
      // TODO: Update user_licenses in Supabase
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('Subscription cancelled:', deletedSubscription.id);
      // TODO: Deactivate license in Supabase
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Payment succeeded:', invoice.id);
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Payment failed:', failedInvoice.id);
      // TODO: Notify user
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on port ${PORT}`);
  console.log(`📡 CORS enabled for: ${process.env.CORS_ORIGIN}`);
});
