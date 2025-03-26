/**
 * Utility functions to replace base64-img functionality
 * Uses native Node.js methods instead of the vulnerable base64-img package
 */
const fs = require('fs')
const path = require('path')

/**
 * Convert an image file to base64 string
 * @param {string} filepath - Path to the image file
 * @returns {string} Base64 encoded string (with data URI scheme)
 */
function imageToBase64 (filepath) {
  try {
    // Read file
    const fileData = fs.readFileSync(filepath)

    // Get mime type based on extension
    const ext = path.extname(filepath).toLowerCase().slice(1)
    const mimeType = getMimeType(ext)

    // Convert to base64 with data URI scheme
    const base64Data = fileData.toString('base64')
    return `data:${mimeType};base64,${base64Data}`
  } catch (error) {
    throw new Error(`Error converting image to base64: ${error.message}`)
  }
}

/**
 * Convert base64 string to image file
 * @param {string} base64Str - Base64 string (with or without data URI scheme)
 * @param {string} outputDir - Directory to save the image
 * @param {string} filename - Filename without extension
 * @returns {string} Path to the saved image
 */
function base64ToImage (base64Str, outputDir, filename) {
  try {
    // Extract actual base64 data if it includes the data URI scheme
    let data = base64Str
    let ext = 'png' // Default extension

    if (base64Str.includes(';base64,')) {
      const matches = base64Str.match(/^data:image\/([A-Za-z]+);base64,(.+)$/)
      if (matches && matches.length === 3) {
        ext = matches[1]
        data = matches[2]
      } else {
        data = base64Str.split(';base64,').pop()
      }
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Create buffer and write to file
    const buffer = Buffer.from(data, 'base64')
    const outputPath = path.join(outputDir, `${filename}.${ext}`)
    fs.writeFileSync(outputPath, buffer)

    return outputPath
  } catch (error) {
    throw new Error(`Error converting base64 to image: ${error.message}`)
  }
}

/**
 * Get the MIME type based on file extension
 * @param {string} ext - File extension
 * @returns {string} MIME type
 */
function getMimeType (ext) {
  const mimeTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp'
  }

  return mimeTypes[ext] || 'image/png'
}

module.exports = {
  imageToBase64,
  base64ToImage
}
