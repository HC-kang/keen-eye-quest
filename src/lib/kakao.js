import { kakaoConfig } from './config'

// Kakao SDK 초기화

export const initKakao = () => {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoConfig.appKey)
    console.log('Kakao SDK initialized:', window.Kakao.isInitialized())
  }
}

export const shareKakao = (score, percentile) => {
  if (!window.Kakao || !window.Kakao.isInitialized()) {
    console.error('Kakao SDK not initialized')
    return
  }

  const gradeEmoji = score >= 90 ? '🏆' : 
                     score >= 80 ? '🥇' : 
                     score >= 70 ? '🥈' : 
                     score >= 60 ? '🥉' : '💪'
  
  const gradeText = score >= 90 ? '탁월한 눈썰미' :
                    score >= 80 ? '뛰어난 눈썰미' :
                    score >= 70 ? '좋은 눈썰미' :
                    score >= 60 ? '평균적인 눈썰미' :
                    '연습이 필요해요'

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `${gradeEmoji} 눈썰미 테스트 결과: ${score}점`,
      description: `${gradeText}! 상위 ${100 - percentile}%의 눈썰미를 가지고 있어요. 당신도 도전해보세요!`,
      imageUrl: 'https://keen-eye-quest.pages.dev/og-image.jpg',
      link: {
        mobileWebUrl: 'https://keen-eye-quest.pages.dev',
        webUrl: 'https://keen-eye-quest.pages.dev',
      },
    },
    buttons: [
      {
        title: '테스트 하러가기',
        link: {
          mobileWebUrl: 'https://keen-eye-quest.pages.dev',
          webUrl: 'https://keen-eye-quest.pages.dev',
        },
      },
    ],
  })
}