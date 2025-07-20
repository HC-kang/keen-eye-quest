// Supabase Configuration
export const supabaseConfig = {
  url: 'https://tdedaytbckiqfmbsspxp.supabase.co',
  anonKey: 'sb_publishable_o3CXkryfFqseicG6N_y_bQ_ppjMWUfM'
}

// Kakao Configuration
export const kakaoConfig = {
  appKey: '64871bc35c3a6a342379c6497921725f' // Kakao Developers에서 발급받은 JavaScript 키
}

// Test Configuration
export const testConfig = {
  totalQuestions: 25,
  questionBreakdown: {
    imageComparisons: 22,    // 20개 이미지 모두 사용 (재사용 허용)
    retestQuestions: 3       // 재검증 문제 (좌우 랜덤 변경)
  },
  resolutions: ['480p', '720p', '1080p', '1440p', '4k'],
  categories: ['product', 'human', 'nature'],
  imagesPerCategory: {
    product: 7,
    human: 7,
    nature: 6
  }
}

// Analytics Configuration
export const analyticsConfig = {
  // 해상도별 기대 정답률 (JND 기반)
  expectedAccuracy: {
    '480p-720p': 0.90,      // 쉬움
    '720p-1080p': 0.75,     // 중간 (가장 중요)
    '1080p-1440p': 0.65,    // 어려움
    '1440p-4k': 0.55,       // 매우 어려움
    '480p-1080p': 0.95,     // 매우 쉬움
    '720p-1440p': 0.85,     // 쉬움
    '1080p-4k': 0.80,       // 중간
  },
  
  // 점수 계산 가중치
  scoreWeights: {
    accuracy: 0.7,
    consistency: 0.2,
    responseTime: 0.1
  }
}