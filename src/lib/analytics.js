// 간소화된 분석 함수들 - DB 저장용 데이터 중심

/**
 * 해상도별 감지 확률 계산
 */
export function calculateDetectionRates(answers) {
  const resolutionPairs = {}
  
  // 모든 응답에서 해상도 쌍 추출
  answers.forEach(answer => {
    const pair = [answer.leftImage, answer.rightImage].sort().join('-')
    if (!resolutionPairs[pair]) {
      resolutionPairs[pair] = { correct: 0, total: 0, responseTimeSum: 0 }
    }
    resolutionPairs[pair].total++
    resolutionPairs[pair].responseTimeSum += answer.responseTime
    if (answer.userAnswer === answer.correctAnswer) {
      resolutionPairs[pair].correct++
    }
  })
  
  // 정답률 계산
  const results = {}
  Object.entries(resolutionPairs).forEach(([pair, data]) => {
    results[pair] = {
      accuracy: data.correct / data.total,
      avgResponseTime: data.responseTimeSum / data.total,
      sampleSize: data.total
    }
  })
  
  return results
}

/**
 * DB 저장용 분석 데이터 생성
 */
export function prepareAnalysisForDB(answers, deviceInfo) {
  const detectionRates = calculateDetectionRates(answers)
  const totalCorrect = answers.filter(a => a.userAnswer === a.correctAnswer).length
  
  // 재검증 일관성
  const retests = answers.filter(a => a.isRetest)
  let consistencyScore = null
  if (retests.length > 0) {
    const consistentRetests = retests.filter(r => {
      const original = answers.find(a => 
        !a.isRetest && 
        a.category === r.category && 
        a.leftImage === r.leftImage && 
        a.rightImage === r.rightImage
      )
      return original && (original.userAnswer === original.correctAnswer) === (r.userAnswer === r.correctAnswer)
    })
    consistencyScore = consistentRetests.length / retests.length
  }
  
  return {
    // 기본 정보
    device_info: deviceInfo,
    total_questions: answers.length,
    correct_count: totalCorrect,
    accuracy: totalCorrect / answers.length,
    consistency_score: consistencyScore,
    
    // 해상도별 감지율
    detection_rates: detectionRates,
    
    // 카테고리별 정답률
    category_scores: {
      product: answers.filter(a => a.category === 'product' && a.userAnswer === a.correctAnswer).length / 
               answers.filter(a => a.category === 'product').length,
      human: answers.filter(a => a.category === 'human' && a.userAnswer === a.correctAnswer).length / 
             answers.filter(a => a.category === 'human').length,
      nature: answers.filter(a => a.category === 'nature' && a.userAnswer === a.correctAnswer).length / 
              answers.filter(a => a.category === 'nature').length,
    },
    
    // 평균 응답 시간
    avg_response_time: answers.reduce((sum, a) => sum + a.responseTime, 0) / answers.length,
    
    // 타임스탬프
    completed_at: new Date().toISOString()
  }
}

/**
 * 사용자용 간단한 결과
 */
export function generateUserResults(answers, deviceInfo) {
  const dbData = prepareAnalysisForDB(answers, deviceInfo)
  const score = Math.round(dbData.accuracy * 100)
  
  // 백분위 (간단한 계산)
  let percentile
  if (score >= 90) percentile = 95
  else if (score >= 80) percentile = 85
  else if (score >= 70) percentile = 70
  else if (score >= 60) percentile = 50
  else if (score >= 50) percentile = 30
  else percentile = 15
  
  // 720p-1080p 구분 능력 (가장 중요)
  const key720p1080p = dbData.detection_rates['720p-1080p']
  let recommendation = '1080p' // 기본값
  
  if (key720p1080p && key720p1080p.accuracy < 0.75) {
    recommendation = '720p'
  } else if (dbData.detection_rates['1080p-1440p'] && 
             dbData.detection_rates['1080p-1440p'].accuracy < 0.75) {
    recommendation = '1080p'
  } else if (dbData.detection_rates['1440p-4k'] && 
             dbData.detection_rates['1440p-4k'].accuracy < 0.75) {
    recommendation = '1440p'
  }
  
  return {
    score,
    percentile,
    recommendation,
    deviceType: deviceInfo.deviceType,
    // DB 저장용 전체 데이터
    dbData
  }
}