const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// 해상도 설정
const RESOLUTIONS = {
  '480p': { width: 854, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 }
};

// 이미지 품질 설정 (각 해상도별로 다르게 설정하여 차이를 만듦)
const QUALITY_SETTINGS = {
  '480p': { quality: 60, mozjpeg: true },
  '720p': { quality: 70, mozjpeg: true },
  '1080p': { quality: 80, mozjpeg: true },
  '1440p': { quality: 85, mozjpeg: true },
  '4k': { quality: 90, mozjpeg: true }
};

async function processImages() {
  const sourceDir = path.join(__dirname, '../image-sources');
  const outputDir = path.join(__dirname, '../public/images');
  
  try {
    // 출력 디렉토리 생성
    await fs.mkdir(outputDir, { recursive: true });
    
    // 소스 디렉토리의 모든 이미지 파일 읽기
    const files = await fs.readdir(sourceDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    
    console.log(`Found ${imageFiles.length} images to process`);
    
    for (const file of imageFiles) {
      const inputPath = path.join(sourceDir, file);
      const baseName = path.basename(file, path.extname(file));
      
      console.log(`\nProcessing: ${file}`);
      
      // 각 해상도별로 이미지 생성
      for (const [resName, dimensions] of Object.entries(RESOLUTIONS)) {
        const outputFileName = `${baseName}_${resName}.jpg`;
        const outputPath = path.join(outputDir, outputFileName);
        
        try {
          await sharp(inputPath)
            .resize(dimensions.width, dimensions.height, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg(QUALITY_SETTINGS[resName])
            .toFile(outputPath);
          
          console.log(`  ✓ ${resName} (${dimensions.width}x${dimensions.height})`);
        } catch (err) {
          console.error(`  ✗ Failed to create ${resName}: ${err.message}`);
        }
      }
    }
    
    console.log('\n✅ Image processing complete!');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

// 스크립트 실행
processImages();