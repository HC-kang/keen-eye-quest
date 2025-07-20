# 이미지 처리 스크립트

## 설치

```bash
npm install sharp --save-dev
```

## 사용 방법

### 1. 이미지 준비

원본 이미지를 다음 구조로 준비합니다:

```
/image-sources/
  /product/
    - image1.jpg
    - image2.jpg
    - ... (최소 7개)
  /landscape/
    - image1.jpg
    - image2.jpg
    - ... (최소 7개)
  /nature/
    - image1.jpg
    - image2.jpg
    - ... (최소 6개)
```

### 2. 스크립트 실행

#### 기본 스크립트 (단순 버전)
```bash
npm run process-images
```
- `/image-sources/` 폴더의 모든 이미지를 처리
- 각 이미지를 5개 해상도로 변환

#### 고급 스크립트 (카테고리별 처리)
```bash
npm run process-images:advanced
```
- 카테고리별로 정리된 이미지 처리
- 자동 번호 매기기 (예: product_001_720p.jpg)
- 품질 설정 최적화

#### WebP 버전도 함께 생성
```bash
npm run process-images:webp
```
- JPEG와 WebP 버전 모두 생성
- 더 나은 압축률과 품질

## 출력

처리된 이미지는 `/public/images/` 폴더에 저장됩니다:

```
/public/images/
  - product_001_480p.jpg
  - product_001_720p.jpg
  - product_001_1080p.jpg
  - product_001_1440p.jpg
  - product_001_4k.jpg
  - ... (총 100개 파일)
```

## 해상도별 설정

- **480p**: 854×480, 품질 55-60%
- **720p**: 1280×720, 품질 65-70%
- **1080p**: 1920×1080, 품질 75-80%
- **1440p**: 2560×1440, 품질 85-87%
- **4K**: 3840×2160, 품질 92-94%

## 주의사항

1. 원본 이미지는 4K 이상의 해상도를 권장합니다
2. 이미지 파일명에 특수문자 사용을 피하세요
3. 지원 포맷: JPG, JPEG, PNG, WebP