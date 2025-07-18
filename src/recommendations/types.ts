export interface CuisineRating {
  userId: string;
  cuisineName: string;
  rating: number;
  timestamp: Date;
}

export interface RecommendationRequest {
  userId: string;
  limit?: number;
}

export interface RecommendationResult {
  cuisineName: string;
  score: number;
  confidenceLevel?: number;
  discoveryLevel?: number;
  reasoning: string;
}

export interface RecommendationResponse {
  recommendations: RecommendationResult[];
  userAdaptationLevel: string;
  totalRatings: number;
  generatedAt: Date;
}

export const CUISINES = [
  'Chinese', 'Korean', 'Japanese', 'Italian', 'Mexican', 
  'Indian', 'Thai', 'French', 'Muslim', 'Vietnamese', 'Western', 'Fast Food'
] as const;

export type CuisineType = typeof CUISINES[number];

export interface UserWithRecommendations {
  id: string;
  preferences: Map<string, number>; 
  hiddenAdjustments?: Map<string, number>; 
  totalRatings?: number;
  adaptationRate?: number;
}

export interface GroupRecommendationRequest {
  groupId: string;
  limit?: number;
}