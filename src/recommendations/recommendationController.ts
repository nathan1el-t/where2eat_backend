// server/src/recommendations/recommendationController.ts

import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../common/utils/catchAsync.js';
import { AppError } from '../common/utils/AppError.js';
import { 
  getPersonalRestaurantRecommendations,
  getGroupRestaurantRecommendations,
  calculatePersonalizedScore,
  getPersonalTopCuisines,
  getGroupTopCuisines
} from './recommendationService.js';
import { searchNearbyPlaces } from '../api/apiService.js';
import { CUISINES, CuisineType } from './types.js';

// GET TOP CUISINES FOR USER/GROUP (for smart algorithm)
export const getTopCuisines = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', StatusCodes.UNAUTHORIZED));
  }

  const { groupId } = req.query;

  try {
    let topCuisines;
    
    if (groupId) {
      // Get group's top cuisines
      topCuisines = await getGroupTopCuisines(groupId as string);
    } else {
      // Get personal top cuisines
      topCuisines = await getPersonalTopCuisines(req.user.id);
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        topCuisines,
        generatedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('Error fetching top cuisines:', error);
    return next(new AppError('Failed to fetch top cuisines', StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

// GET PERSONAL RESTAURANT RECOMMENDATIONS (targeted cuisine calls)
export const getPersonalRecommendations = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', StatusCodes.UNAUTHORIZED));
  }

  const { lat, lng, cuisine, radius = 2000, limit = 4 } = req.query;

  // Validate required parameters
  if (!lat || !lng || !cuisine) {
    return next(new AppError('Latitude, longitude, and cuisine are required', StatusCodes.BAD_REQUEST));
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    return next(new AppError('Invalid latitude or longitude values', StatusCodes.BAD_REQUEST));
  }

  // Validate cuisine
  if (!CUISINES.includes(cuisine as CuisineType)) {
    return next(new AppError(`Invalid cuisine. Must be one of: ${CUISINES.join(', ')}`, StatusCodes.BAD_REQUEST));
  }

  try {
    // Make targeted search for specific cuisine
    const searchParams = {
      lat: latitude,
      lng: longitude,
      keyword: `${cuisine} restaurant`,
      radius: parseInt(radius as string, 10),
      type: 'restaurant'
    };

    const placesData = await searchNearbyPlaces(searchParams);

    if (placesData.results.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: {
          restaurants: [],
          cuisine: cuisine,
          generatedAt: new Date()
        }
      });
    }

    // Get personalized recommendations for this cuisine
    const recommendations = await getPersonalRestaurantRecommendations(
      req.user.id,
      placesData.results,
      cuisine as CuisineType,
      parseInt(limit as string, 10) || 4
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        restaurants: recommendations,
        cuisine: cuisine,
        generatedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('Error fetching personal recommendations:', error);
    return next(new AppError('Failed to fetch restaurant recommendations', StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

// GET GROUP RESTAURANT RECOMMENDATIONS (targeted cuisine calls)
export const getGroupRecommendations = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', StatusCodes.UNAUTHORIZED));
  }

  const { groupId } = req.params;
  const { lat, lng, cuisine, radius = 2000, limit = 4 } = req.query;

  // Validate required parameters
  if (!lat || !lng || !cuisine) {
    return next(new AppError('Latitude, longitude, and cuisine are required', StatusCodes.BAD_REQUEST));
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    return next(new AppError('Invalid latitude or longitude values', StatusCodes.BAD_REQUEST));
  }

  // Validate cuisine
  if (!CUISINES.includes(cuisine as CuisineType)) {
    return next(new AppError(`Invalid cuisine. Must be one of: ${CUISINES.join(', ')}`, StatusCodes.BAD_REQUEST));
  }

  try {
    // Make targeted search for specific cuisine
    const searchParams = {
      lat: latitude,
      lng: longitude,
      keyword: `${cuisine} restaurant`,
      radius: parseInt(radius as string, 10),
      type: 'restaurant'
    };

    const placesData = await searchNearbyPlaces(searchParams);

    if (placesData.results.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: {
          restaurants: [],
          cuisine: cuisine,
          groupId: groupId,
          generatedAt: new Date()
        }
      });
    }

    // Get group recommendations for this cuisine
    const recommendations = await getGroupRestaurantRecommendations(
      groupId,
      placesData.results,
      cuisine as CuisineType,
      parseInt(limit as string, 10) || 4
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        restaurants: recommendations,
        cuisine: cuisine,
        groupId: groupId,
        generatedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('Error fetching group recommendations:', error);
    return next(new AppError('Failed to fetch group restaurant recommendations', StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

// PREDICT SINGLE RESTAURANT SCORE
export const predictRestaurantScore = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', StatusCodes.UNAUTHORIZED));
  }

  const { place_id, name, rating, cuisine } = req.query;

  if (!place_id || !name || !cuisine) {
    return next(new AppError('place_id, name, and cuisine are required', StatusCodes.BAD_REQUEST));
  }

  // Validate cuisine
  if (!CUISINES.includes(cuisine as CuisineType)) {
    return next(new AppError(`Invalid cuisine. Must be one of: ${CUISINES.join(', ')}`, StatusCodes.BAD_REQUEST));
  }

  try {
    const googleRating = rating ? parseFloat(rating as string) : 3.0;
    
    // Calculate personalized score
    const score = await calculatePersonalizedScore(
      req.user.id,
      cuisine as CuisineType,
      googleRating
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        place_id,
        name,
        cuisine,
        google_rating: googleRating,
        personalized_score: Number(score.toFixed(2)),
        formula: 'Google Rating × 0.3 + (Manual Preference × Weight) × 0.7'
      }
    });

  } catch (error: any) {
    console.error('Error predicting restaurant score:', error);
    return next(new AppError('Failed to predict restaurant score', StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

// SUBMIT RATING AND UPDATE WEIGHTS
export const submitRating = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', StatusCodes.UNAUTHORIZED));
  }

  const { restaurantId, cuisine, rating, googleRating } = req.body;

  // Validate inputs
  if (!restaurantId || !cuisine || rating === undefined) {
    return next(new AppError('Restaurant ID, cuisine, and rating are required', StatusCodes.BAD_REQUEST));
  }

  if (rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', StatusCodes.BAD_REQUEST));
  }

  if (!CUISINES.includes(cuisine as CuisineType)) {
    return next(new AppError(`Invalid cuisine. Must be one of: ${CUISINES.join(', ')}`, StatusCodes.BAD_REQUEST));
  }

  try {
    // Import the update function
    const { updateWeightsAfterRating } = await import('./recommendationService.js');
    
    // Update weights based on this rating
    await updateWeightsAfterRating(
      req.user.id,
      restaurantId,
      cuisine as CuisineType,
      rating,
      googleRating || 3.0
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Rating submitted and weights updated',
      data: {
        restaurantId,
        rating,
        cuisine
      }
    });

  } catch (error: any) {
    console.error('Error submitting rating:', error);
    return next(new AppError('Failed to submit rating', StatusCodes.INTERNAL_SERVER_ERROR));
  }
});