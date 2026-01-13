# Daily Sales Scanner

A production-ready Progressive Web App (PWA) for scanning 2-page daily sales reports, extracting data using OCR + AI, and appending results to Google Sheets.

## Features

- 📸 Mobile-first camera capture for scanning documents
- 🔄 Image rotation and preprocessing for better OCR accuracy
- 🤖 AI-powered data extraction using OpenAI or Google Gemini
- 📊 Direct integration with Google Sheets via Apps Script
- ✅ Smart validation with confidence highlighting
- 📱 Installable as PWA on mobile devices
- 🎨 Clean, touch-friendly UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (React 19) + TypeScript + Tailwind CSS
- **OCR**: Google Cloud Vision API (DOCUMENT_TEXT_DETECTION)
- **AI Parsing**: Pluggable LLM parser (OpenAI GPT-4 or Google Gemini)
- **Sheet Integration**: Google Apps Script Web App
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18 or higher
- Google Cloud account with Vision API enabled
- OpenAI API key OR Google Gemini API key
- Google account for Apps Script and Sheets

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/karlmendoo/sales-report-scanner.git
cd sales-report-scanner
npm install
```

### 2. Set Up Google Cloud Vision API

#### Option A: API Key (Simplest)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Cloud Vision API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
   - (Optional) Restrict the key to Vision API only

#### Option B: Service Account (More secure for production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Click "Create Service Account"
4. Give it a name and grant "Cloud Vision API User" role
5. Create a JSON key
6. Base64 encode the JSON file:
   ```bash
   cat service-account.json | base64 -w 0
   ```
7. Use the encoded string as `GOOGLE_APPLICATION_CREDENTIALS_JSON`

**Billing Note**: Google Cloud Vision API offers 1,000 free units per month. After that, it's $1.50 per 1,000 images. See [pricing](https://cloud.google.com/vision/pricing).

### 3. Set Up AI Provider

#### Option A: OpenAI (Recommended)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Create a new API key
5. Copy the key (starts with `sk-`)

#### Option B: Google Gemini

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy the key

### 4. Set Up Google Apps Script

1. Open your Google Spreadsheet (or create a new one)
2. Go to **Extensions** > **Apps Script**
3. Delete any existing code
4. Copy the contents of `scripts/Code.gs` and paste it
5. Update the configuration variables:
   ```javascript
   const SHARED_SECRET = 'your_random_secret_token_here'; // Generate a random string
   const SPREADSHEET_ID = 'your_spreadsheet_id'; // From spreadsheet URL
   ```
6. Click **Deploy** > **New deployment**
7. Click the gear icon ⚙️ next to "Select type"
8. Choose **Web app**
9. Configure:
   - **Description**: Daily Sales Scanner API
   - **Execute as**: Me
   - **Who has access**: Anyone
10. Click **Deploy**
11. Copy the **Web App URL** (ends with `/exec`)
12. Click **Authorize access** and grant permissions

**Important**: Save both the Web App URL and the secret token you generated.

### 5. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Google Cloud Vision API
GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key_here

# LLM Provider (openai or gemini)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_key_here

# Google Apps Script Web App
APPS_SCRIPT_WEBAPP_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
SHARED_SECRET_TOKEN=your_random_secret_token_here

# Sheet Configuration
DEFAULT_SHEET_NAME=DailySales

# Demo Mode (optional - set to 'true' to test without API calls)
DEMO_MODE=false
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing with Demo Mode

To test the application without setting up all APIs:

1. Set `DEMO_MODE=true` in your `.env.local`
2. Start the dev server
3. The app will use mock data instead of real OCR/AI calls
4. You'll still need to configure the Google Apps Script for the final submission step

## Google Sheet Column Structure

The app appends rows to your Google Sheet with the following columns:

```
Date, MeterStart, MeterEnd, CubicConsumption,
GallonsQty, 500mlQty, WilkinsQty, SmallSlimQty,
GallonsPrice, 500mlPrice, WilkinsPrice, SmallSlimPrice,
Transportation, Labor, Supplies, UtangPaid, OtherExpenses,
IsCashAdvanceDay, CA_Ryan, CA_Rjhay, CA_Third,
TotalCashAdvance, Remarks
```

The Apps Script automatically creates these headers if the sheet doesn't exist.

## Usage Flow

1. **Home Screen**: Capture or upload both pages of your sales report
2. **Preview**: Rotate images if needed for proper orientation
3. **Extract**: Click "Extract Data" to process with OCR + AI
4. **Review**: Verify extracted data (yellow highlights indicate low confidence fields)
5. **Submit**: Send data to Google Sheets
6. **Success**: See confirmation with appended row number

## Deployment to Production

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add all environment variables from `.env.local`
5. Deploy

Alternatively, use the Vercel CLI:

```bash
npm install -g vercel
vercel
```

### Other Deployment Options

- **Netlify**: Similar process to Vercel
- **AWS Amplify**: Connect your GitHub repo
- **Docker**: Build and deploy the Next.js app containerized

## Project Structure

```
/
├── app/                      # Next.js app router pages
│   ├── page.tsx             # Home/Scanner page
│   ├── review/              # Review page
│   ├── success/             # Success confirmation page
│   ├── api/                 # API routes
│   │   ├── extract/         # OCR + AI extraction endpoint
│   │   └── append/          # Google Sheets append endpoint
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── CameraCapture.tsx
│   ├── FileUpload.tsx
│   ├── ImagePreview.tsx
│   └── ReviewForm.tsx
├── lib/                     # Utility libraries
│   ├── ocr/                # Google Vision API client
│   ├── parser/             # AI parser (OpenAI/Gemini)
│   ├── image/              # Image preprocessing
│   ├── validation/         # Data validation & schema
│   └── sheets/             # Google Sheets integration
├── types/                   # TypeScript type definitions
├── scripts/                 # Google Apps Script files
│   └── Code.gs
├── public/                  # Static assets
│   ├── manifest.json       # PWA manifest
│   └── icons/              # PWA icons
├── .env.example            # Environment variables template
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Dependencies
```

## Computation Rules

The app automatically computes:

- **Cubic Consumption**: If missing, calculated as `meter_end - meter_start`
- **IsCashAdvanceDay**: `true` if date is the 15th of the month
- **TotalCashAdvance**: Sum of all cash advance fields (only on cash advance days)

## Validation Rules

- **Date**: Required, must be valid YYYY-MM-DD format
- **Meter Readings**: If both present, `meter_end >= meter_start`
- **All Numbers**: Must be non-negative
- **Low Confidence Fields**: Highlighted in yellow for review

## Data Schema

The extracted JSON follows this structure:

```typescript
{
  date: string;              // YYYY-MM-DD
  meter_start: number | null;
  meter_end: number | null;
  cubic_consumption: number | null;
  qty: {
    gallons: number | null;
    "500ml": number | null;
    wilkins: number | null;
    small_slim: number | null;
  };
  price: {
    gallons: number | null;
    "500ml": number | null;
    wilkins: number | null;
    small_slim: number | null;
  };
  expenses: {
    transportation: number | null;
    labor: number | null;
    supplies: number | null;
    utang_paid: number | null;
    other: number | null;
  };
  cash_advance: {
    ryan: number | null;
    rjhay: number | null;
    third: number | null;
  };
  remarks: string | null;
}
```

## Troubleshooting

### OCR Not Working

- Verify Google Cloud Vision API is enabled
- Check API key is correct and not restricted
- Ensure images are clear and well-lit
- Try rotating images for better orientation

### AI Extraction Errors

- Verify OpenAI/Gemini API key is valid
- Check API credits/quota
- Try demo mode to test other parts of the app

### Sheets Append Fails

- Verify Apps Script deployment URL is correct
- Ensure shared secret token matches
- Check Apps Script permissions are granted
- Test the Apps Script with the `testAppendRow()` function

### PWA Not Installing

- Ensure you're using HTTPS (required for PWA)
- Check manifest.json is accessible
- Verify icon files exist
- Clear browser cache and try again

## Security Notes

- Never commit `.env.local` or actual API keys to git
- Use environment variables for all sensitive data
- Restrict Google Cloud API keys to specific APIs
- Use HTTPS in production
- Regularly rotate your shared secret token

## Cost Estimates

**Monthly costs for 100 scans:**

- Google Cloud Vision: $0.15 (1,000 free units/month, then $1.50/1,000)
- OpenAI GPT-4 Mini: ~$0.30 (varies by token usage)
- Gemini: Free tier available (15 requests/minute)
- Vercel: Free tier sufficient for most use cases
- Google Sheets: Free

**Total: ~$0.45/month** (after free tiers)

## Browser Support

- Chrome/Edge: ✅ Full support
- Safari (iOS): ✅ Full support
- Firefox: ✅ Full support
- Samsung Internet: ✅ Full support

## PWA Installation

### On iOS (Safari)

1. Open the app in Safari
2. Tap the Share button
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

### On Android (Chrome)

1. Open the app in Chrome
2. Tap the menu (⋮)
3. Tap "Install app" or "Add to Home screen"
4. Tap "Install"

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Review Google Cloud and OpenAI documentation

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
