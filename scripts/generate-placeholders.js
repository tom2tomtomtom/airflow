const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create directory if it doesn't exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Generate a placeholder image with text
const generatePlaceholderImage = (width, height, text, bgColor, textColor, filePath) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = textColor;
  ctx.font = `${Math.floor(width / 20)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Wrap text if needed
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(`${currentLine} ${word}`).width;
    if (width < canvas.width - 20) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  // Draw text lines
  const lineHeight = Math.floor(width / 15);
  const startY = height / 2 - (lines.length * lineHeight) / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight);
  });

  // Save image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: ${filePath}`);
};

// Main function to generate all placeholder images
const generatePlaceholders = () => {
  const publicDir = path.join(__dirname, '..', 'public');
  const mockImagesDir = path.join(publicDir, 'mock-images');
  const mockVideosDir = path.join(publicDir, 'mock-videos');
  const mockVoicesDir = path.join(publicDir, 'mock-voices');

  // Ensure directories exist
  ensureDirectoryExists(mockImagesDir);
  ensureDirectoryExists(mockVideosDir);
  ensureDirectoryExists(mockVoicesDir);

  // Generate weight loss images
  generatePlaceholderImage(
    800, 600, 
    'Weight Loss Transformation', 
    '#3a86ff', '#ffffff',
    path.join(mockImagesDir, 'weight-loss-1.jpg')
  );
  
  generatePlaceholderImage(
    800, 600, 
    'Healthy Meal Preparation', 
    '#06d6a0', '#ffffff',
    path.join(mockImagesDir, 'weight-loss-2.jpg')
  );

  // Generate generic image
  generatePlaceholderImage(
    800, 600, 
    'Generated Image', 
    '#8338ec', '#ffffff',
    path.join(mockImagesDir, 'generated-image.jpg')
  );

  // Generate video thumbnails
  generatePlaceholderImage(
    800, 450, 
    'Weight Loss Journey Video', 
    '#ef476f', '#ffffff',
    path.join(mockVideosDir, 'weight-loss-journey-thumb.jpg')
  );
  
  generatePlaceholderImage(
    800, 450, 
    'Nutrition Tips Video', 
    '#ffd166', '#000000',
    path.join(mockVideosDir, 'nutrition-tips-thumb.jpg')
  );
  
  generatePlaceholderImage(
    800, 450, 
    'Processing Video...', 
    '#073b4c', '#ffffff',
    path.join(mockVideosDir, 'processing-thumb.jpg')
  );
  
  generatePlaceholderImage(
    800, 450, 
    'Generated Video', 
    '#118ab2', '#ffffff',
    path.join(mockVideosDir, 'generated-video-thumb.jpg')
  );

  // Create empty audio files
  fs.writeFileSync(path.join(mockVoicesDir, 'weight-loss-intro.mp3'), '');
  fs.writeFileSync(path.join(mockVoicesDir, 'expert-advice.mp3'), '');
  fs.writeFileSync(path.join(mockVoicesDir, 'generated-voice.mp3'), '');

  console.log('All placeholder files generated successfully!');
};

// Run the generator
generatePlaceholders();
