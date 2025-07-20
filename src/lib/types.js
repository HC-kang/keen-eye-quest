// Type definitions for the test application

export const QuestionType = {
  id: 0,
  category: '', // 'product' | 'human' | 'nature'
  imageId: '',
  leftResolution: '',
  rightResolution: '',
  correctAnswer: '', // 'left' | 'right'
  isRetest: false
}

export const DeviceInfoType = {
  screenResolution: '',
  pixelRatio: 1,
  colorDepth: 0,
  deviceType: '', // 'mobile' | 'tablet' | 'desktop'
  touchSupport: false,
  userAgent: '',
  browser: '',
  browserVersion: '',
  orientation: '',
  timestamp: ''
}

export const TestResultType = {
  score: 0,
  percentile: 0,
  correctCount: 0,
  totalQuestions: 0
}