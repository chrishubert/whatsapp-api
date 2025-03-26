const fs = require('fs')
const path = require('path')
// Replace base64-img with our custom utility
const { base64ToImage } = require('../src/utils/imageUtils')

// Create simple WhatsApp-themed favicon (64x64 green square with 'WA' text)
const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#25D366" />
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="28" font-weight="bold"
    text-anchor="middle" dy=".3em" fill="white">WA</text>
</svg>
`

// Make sure the directory exists
const assetsDir = path.join(__dirname, '..', 'assets')
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true })
}

// Save the SVG to a temporary file
const svgPath = path.join(assetsDir, 'temp_favicon.svg')
fs.writeFileSync(svgPath, svgContent)

// Convert SVG to data URI (simple equivalent of base64-img.base64)
const svgData = `data:image/svg+xml;base64,${fs.readFileSync(svgPath).toString('base64')}`

// Save as PNG using our custom utility
try {
  const filepath = base64ToImage(svgData, assetsDir, 'favicon')
  console.log('Favicon created at:', filepath)

  // Clean up temporary files
  try {
    fs.unlinkSync(svgPath)
  } catch (e) {
    console.error('Error cleaning up temporary SVG file:', e)
  }
} catch (err) {
  console.error('Error saving PNG:', err)
}

console.log('Favicon generator executed')
