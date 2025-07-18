import { User } from '../users/userModel.js';
import { Group } from '../groups/groupModel.js';
import { CUISINES, CuisineType } from './types.js';

interface GooglePlace {
  place_id: string;
  name: string;
  vicinity?: string;
  rating?: number;
  price_level?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  types: string[];
  business_status?: string;
}

interface RestaurantRecommendation {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  price_level?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  types: string[];
  cuisine: string;
  cuisineScore: number;
  combinedScore: number;
  reasoning: string;
}

// CALCULATE PERSONALIZED SCORE: Google Rating × 0.3 + (Manual Preference × Weight) × 0.7
export const calculatePersonalizedScore = async (
  userId: string,
  cuisine: CuisineType,
  googleRating: number
): Promise<number> => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Get manual preference (1-5 scale from user settings)
  const manualPreference = user.preferences.get(cuisine) || 3;
  
  // Get learned weight (default 1.0, adjusted based on past ratings)
  const weight = user.cuisineWeights?.get(cuisine) || 1.0;
  
  // Calculate cuisine score (manual preference × weight)
  const cuisineScore = manualPreference * weight;
  
  // Combine: Google Rating × 0.3 + Cuisine Score × 0.7
  const finalScore = (googleRating * 0.3) + (cuisineScore * 0.7);
  
  // Keep within 1-5 range
  return Math.max(1, Math.min(5, finalScore));
};

// GET PERSONAL TOP CUISINES (ranked by preference × weight)
export const getPersonalTopCuisines = async (userId: string): Promise<Array<{cuisine: string, score: number}>> => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const topCuisines: Array<{cuisine: string, score: number}> = [];

  // Calculate score for each cuisine (preference × weight)
  for (const cuisine of CUISINES) {
    const preference = user.preferences.get(cuisine) || 3;
    const weight = user.cuisineWeights?.get(cuisine) || 1.0;
    const score = preference * weight;
    
    topCuisines.push({
      cuisine,
      score: Number(score.toFixed(2))
    });
  }

  // Sort by score (highest first) and return top cuisines
  return topCuisines
    .sort((a, b) => b.score - a.score)
    .slice(0, 6); // Return top 6 for flexibility
};

// GET GROUP TOP CUISINES (simple average of all members)
export const getGroupTopCuisines = async (groupId: string): Promise<Array<{cuisine: string, score: number}>> => {
  const group = await Group.findById(groupId).populate('users.user');
  if (!group) throw new Error('Group not found');

  const userIds = group.users.map(member => member.user._id);
  const users = await User.find({ _id: { $in: userIds } });

  const topCuisines: Array<{cuisine: string, score: number}> = [];

  // Simple average calculation
  for (const cuisine of CUISINES) {
    let totalScore = 0;
    let memberCount = 0;

    for (const user of users) {
      const preference = user.preferences.get(cuisine) || 3;
      const weight = user.cuisineWeights?.get(cuisine) || 1.0;
      const userScore = preference * weight;

      totalScore += userScore;
      memberCount++;
    }

    const avgScore = memberCount > 0 ? totalScore / memberCount : 3;

    topCuisines.push({
      cuisine,
      score: Number(avgScore.toFixed(2))
    });
  }

  // Sort by score (highest first)
  return topCuisines
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
};

// GET PERSONAL RESTAURANT RECOMMENDATIONS (for specific cuisine)
export const getPersonalRestaurantRecommendations = async (
  userId: string,
  googlePlaces: GooglePlace[],
  cuisine: CuisineType,
  limit: number = 4
): Promise<RestaurantRecommendation[]> => {
  const recommendations: RestaurantRecommendation[] = [];

  // Get user data for reasoning
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const manualPreference = user.preferences.get(cuisine) || 3;
  const weight = user.cuisineWeights?.get(cuisine) || 1.0;
  const cuisineScore = manualPreference * weight;

  for (const place of googlePlaces) {
    try {
      // Get Google rating (default to 3.0 if not available)
      const googleRating = place.rating || 3.0;
      
      // Calculate personalized score
      const combinedScore = await calculatePersonalizedScore(userId, cuisine, googleRating);
      
      // Create reasoning explanation
      const reasoning = `Your ${cuisine} preference (${manualPreference.toFixed(1)}/5) × weight (${weight.toFixed(2)}) + restaurant rating (${googleRating.toFixed(1)}/5)`;

      // Build recommendation object
      const recommendation: RestaurantRecommendation = {
        place_id: place.place_id,
        name: place.name,
        vicinity: place.vicinity || 'Location not available',
        rating: place.rating,
        price_level: place.price_level,
        geometry: place.geometry,
        photos: place.photos,
        types: place.types,
        cuisine,
        cuisineScore: Number(cuisineScore.toFixed(2)),
        combinedScore: Number(combinedScore.toFixed(2)),
        reasoning
      };

      recommendations.push(recommendation);

    } catch (error) {
      console.error(`Error processing restaurant ${place.name}:`, error);
      // Continue with other restaurants if one fails
    }
  }

  // Sort by combined score (highest first) and return top results
  const sortedRecommendations = recommendations
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, limit);

  console.log(`Generated ${sortedRecommendations.length} personal recommendations for ${cuisine} cuisine`);
  
  return sortedRecommendations;
};

// GET GROUP RESTAURANT RECOMMENDATIONS (simple average group preferences for specific cuisine)
export const getGroupRestaurantRecommendations = async (
  groupId: string,
  googlePlaces: GooglePlace[],
  cuisine: CuisineType,
  limit: number = 4
): Promise<RestaurantRecommendation[]> => {
  const recommendations: RestaurantRecommendation[] = [];

  // Get group and populate users
  const group = await Group.findById(groupId).populate('users.user');
  if (!group) throw new Error('Group not found');

  const userIds = group.users.map(member => member.user._id);
  const users = await User.find({ _id: { $in: userIds } });

  // Calculate simple group average for this cuisine
  let totalPreference = 0;
  let totalWeight = 0;
  let memberCount = 0;

  for (const user of users) {
    const preference = user.preferences.get(cuisine) || 3;
    const weight = user.cuisineWeights?.get(cuisine) || 1.0;
    
    totalPreference += preference;
    totalWeight += weight;
    memberCount++;
  }

  const avgPreference = memberCount > 0 ? totalPreference / memberCount : 3;
  const avgWeight = memberCount > 0 ? totalWeight / memberCount : 1.0;
  const groupCuisineScore = avgPreference * avgWeight;

  for (const place of googlePlaces) {
    try {
      // Get Google rating (default to 3.0 if not available)
      const googleRating = place.rating || 3.0;
      
      // Calculate group score: Google Rating × 0.3 + Group Cuisine Score × 0.7
      const combinedScore = (googleRating * 0.3) + (groupCuisineScore * 0.7);
      const finalScore = Math.max(1, Math.min(5, combinedScore));
      
      // Create reasoning explanation
      const reasoning = `Group ${cuisine} preference (${avgPreference.toFixed(1)}/5 avg) × weight (${avgWeight.toFixed(2)} avg) + restaurant rating (${googleRating.toFixed(1)}/5)`;

      // Build recommendation object
      const recommendation: RestaurantRecommendation = {
        place_id: place.place_id,
        name: place.name,
        vicinity: place.vicinity || 'Location not available',
        rating: place.rating,
        price_level: place.price_level,
        geometry: place.geometry,
        photos: place.photos,
        types: place.types,
        cuisine,
        cuisineScore: Number(groupCuisineScore.toFixed(2)),
        combinedScore: Number(finalScore.toFixed(2)),
        reasoning
      };

      recommendations.push(recommendation);

    } catch (error) {
      console.error(`Error processing restaurant ${place.name}:`, error);
      // Continue with other restaurants if one fails
    }
  }

  // Sort by combined score (highest first) and return top results
  const sortedRecommendations = recommendations
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, limit);

  console.log(`Generated ${sortedRecommendations.length} group recommendations for ${cuisine} cuisine (${memberCount} members)`);
  
  return sortedRecommendations;
};

// UPDATE WEIGHTS AFTER USER RATES A RESTAURANT
export const updateWeightsAfterRating = async (
  userId: string,
  restaurantId: string,
  cuisine: CuisineType,
  actualRating: number,
  googleRating: number
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Get what we predicted
  const predictedScore = await calculatePersonalizedScore(userId, cuisine, googleRating);
  
  // Calculate error (positive = they liked it more, negative = they liked it less)
  const error = actualRating - predictedScore;
  
  // Get current weight for this cuisine (default 1.0)
  const currentWeight = user.cuisineWeights?.get(cuisine) || 1.0;
  
  // Adjust weight based on error direction and magnitude
  let newWeight = currentWeight;
  
  if (error > 1.0) {
    // They liked it way more than predicted - boost weight significantly
    newWeight += 0.15;
  } else if (error > 0.5) {
    // They liked it more than predicted - small boost
    newWeight += 0.08;
  } else if (error < -1.0) {
    // They liked it way less than predicted - reduce weight significantly
    newWeight -= 0.15;
  } else if (error < -0.5) {
    // They liked it less than predicted - small reduction
    newWeight -= 0.08;
  }
  
  // Keep weight within reasonable bounds (0.5 to 1.5)
  newWeight = Math.max(0.5, Math.min(1.5, newWeight));
  
  // Initialize cuisineWeights if needed
  if (!user.cuisineWeights) {
    user.cuisineWeights = new Map();
  }
  
  // Save updated weight
  user.cuisineWeights.set(cuisine, newWeight);
  await user.save();
  
  console.log(`Updated ${cuisine} weight for user ${userId}: ${currentWeight.toFixed(3)} → ${newWeight.toFixed(3)} (error: ${error.toFixed(2)})`);
};