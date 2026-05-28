export type AgeRangeKey = 'TEENS' | 'TWENTIES' | 'THIRTIES' | 'FORTIES' | 'FIFTIES';
export type GenderKey = 'MALE' | 'FEMALE' | 'OTHER';
export type MediaTypeKey = 'FILM' | 'DRAMA' | 'OTT' | 'WEB_DRAMA' | 'SHORT_FILM' | 'AD' | 'MUSIC_VIDEO' | 'OTHER';
export type FilmRoleKey = 'LEAD' | 'SUPPORTING' | 'EXTRA' | 'OTHER';
export type OfferStatusKey = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'AUDITION_SUBMITTED' | 'EXPIRED';
export type NotificationTypeKey = 'CASTING' | 'FEED' | 'SYSTEM';
export type RoleTypeKey = 'ACTOR' | 'AGENCY' | 'ADMIN';

export interface FilmographyItem {
  id: string;
  title: string;
  mediaType: MediaTypeKey;
  role: FilmRoleKey;
  characterName: string | null;
  genre: string | null;
  year: number;
  thumbnailUrl: string | null;
  description: string | null;
  sortOrder: number;
}

export interface ShowreelItem {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  tags: string[];
  isFeatured: boolean;
  sortOrder: number;
}

export interface ActorListItem {
  id: string;
  name: string | null;
  image: string | null;
  ageRange: AgeRangeKey | null;
  location: string | null;
  skills: string[];
  filmographyCount: number;
  showreelCount: number;
}

export interface ActorDetail extends ActorListItem {
  coverImage: string | null;
  bio: string | null;
  contactableTime: string | null;
  gender: GenderKey | null;
  height: number | null;
  weight: number | null;
  preferredGenres: string[];
  publicPortfolioUrl: string | null;
  filmographies: FilmographyItem[];
  showreels: ShowreelItem[];
}

export interface CastingOfferWithDetails {
  id: string;
  status: OfferStatusKey;
  shootingPeriod: string | null;
  shootingLocation: string | null;
  conditions: string | null;
  message: string | null;
  rejectReason: string | null;
  auditionVideoUrl: string | null;
  auditionNote: string | null;
  createdAt: string;
  project: {
    id: string;
    title: string;
    mediaType: string;
    genre: string | null;
    logline: string | null;
    synopsis: string | null;
  };
  character: {
    id: string;
    name: string;
    ageRange: AgeRangeKey | null;
    gender: GenderKey | null;
    description: string | null;
    keywords: string[];
  };
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface NotificationItem {
  id: string;
  type: NotificationTypeKey;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  mediaType: string;
  genre: string | null;
  platform: string | null;
  logline: string | null;
  synopsis: string | null;
  recruitStatus: string;
  createdAt: string;
  characters: CharacterItem[];
}

export interface CharacterItem {
  id: string;
  name: string;
  ageRange: AgeRangeKey | null;
  gender: GenderKey | null;
  description: string | null;
  keywords: string[];
  castingStatus: string;
}
