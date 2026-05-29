export const AGE_RANGE_OPTIONS = ['10대', '20대', '30대', '40대', '50대'] as const;

export const AGE_RANGE_MAP = {
  TEENS: '10대',
  TWENTIES: '20대',
  THIRTIES: '30대',
  FORTIES: '40대',
  FIFTIES: '50대',
} as const;

export const GENDER_OPTIONS = ['남성', '여성'] as const;

export const GENDER_MAP = {
  MALE: '남성',
  FEMALE: '여성',
  OTHER: '기타',
} as const;

export const LOCATION_OPTIONS = [
  '서울', '경기도', '인천', '부산', '대구', '광주', '대전', '울산',
  '세종', '강원도', '충청북도', '충청남도', '전라북도', '전라도',
  '경상북도', '경상도', '제주도',
] as const;

export const GENRE_OPTIONS = [
  '드라마', '로맨스', '코미디', '액션', '스릴러', 'SF', '판타지', '공포', '범죄', '역사',
] as const;

export const MEDIA_TYPE_OPTIONS = [
  '드라마', '영화', 'OTT', '웹드라마', '단편', '광고', '뮤직비디오', '기타',
] as const;

export const MEDIA_TYPE_MAP = {
  DRAMA: '드라마',
  FILM: '영화',
  OTT: 'OTT',
  WEB_DRAMA: '웹드라마',
  SHORT_FILM: '단편',
  AD: '광고',
  MUSIC_VIDEO: '뮤직비디오',
  OTHER: '기타',
} as const;

export const ROLE_OPTIONS = ['주연', '조연', '단역', '기타'] as const;

export const ROLE_MAP = {
  LEAD: '주연',
  SUPPORTING: '조연',
  EXTRA: '단역',
  OTHER: '기타',
} as const;

export const POSITION_OPTIONS = [
  '실장', '팀장', '매니저', '대표', '프리랜서', '기타',
] as const;

export const PLATFORM_OPTIONS = [
  'OTT', '지상파', '케이블', '유튜브', '넷플릭스', '왓챠', '시즌', '기타',
] as const;

export const SKILL_SUGGESTIONS = [
  '액션(와이어/수중)', '피아노', '검술', '승마', '외국어 연기',
  '현대 무용', '발레', '노래', '기타(악기)', '운전',
  '보컬', '랩', '방언 연기', '카리스마', '청춘물 감성',
] as const;

export const CHARACTER_KEYWORD_SUGGESTIONS = [
  '차분함', '유머러스', '리더십', '괴짜', '냉철함',
  '따뜻함', '강인함', '섬세함', '반전매력', '카리스마',
] as const;

export const CASTING_STATUS_MAP = {
  PENDING: '대기중',
  ACCEPTED: '수락',
  REJECTED: '거절',
  AUDITION_SUBMITTED: '오디션 제출',
  SELECTED: '최종 합격',
  REJECTED_AFTER_AUDITION: '최종 불합격',
  EXPIRED: '만료',
} as const;

export const NOTIFICATION_TYPE_MAP = {
  CASTING: '캐스팅',
  FEED: '피드',
  SYSTEM: '시스템',
} as const;

export const YEAR_OPTIONS = Array.from(
  { length: 30 },
  (_, i) => String(new Date().getFullYear() - i)
);
