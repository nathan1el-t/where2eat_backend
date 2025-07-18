// server/src/api/apiController.ts
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../common/utils/catchAsync.js';
import { AppError } from '../common/utils/AppError.js';
import { searchNearbyPlaces, getPlacePhotoStream } from './apiService.js';
import type { Request, Response } from 'express';

export const searchPlaces = catchAsync(async (req: Request, res: Response, next) => {
  const { lat, lng, keyword, radius, type, limit } = req.query;

  // Validate required parameters
  if (!lat || !lng) {
    return next(new AppError('Latitude and longitude are required', StatusCodes.BAD_REQUEST));
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    return next(new AppError('Invalid latitude or longitude values', StatusCodes.BAD_REQUEST));
  }

  // Validate coordinate ranges
  if (latitude < -90 || latitude > 90) {
    return next(new AppError('Latitude must be between -90 and 90', StatusCodes.BAD_REQUEST));
  }

  if (longitude < -180 || longitude > 180) {
    return next(new AppError('Longitude must be between -180 and 180', StatusCodes.BAD_REQUEST));
  }

  try {
    const searchParams = {
      lat: latitude,
      lng: longitude,
      keyword: keyword as string || undefined,
      radius: radius ? parseInt(radius as string, 10) : 2000,
      type: type as string || 'restaurant'
    };

    const placesData = await searchNearbyPlaces(searchParams);
    
    // Apply limit if specified
    let results = placesData.results;
    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        results = results.slice(0, limitNum);
      }
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        results,
        status: placesData.status,
        next_page_token: placesData.next_page_token,
        total_results: placesData.results.length,
        returned_results: results.length
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError('Failed to search places', StatusCodes.INTERNAL_SERVER_ERROR));
  }
});

export const getPlacePhoto = catchAsync(async (req: Request, res: Response, next) => {
  const { photoReference } = req.params;
  const { maxWidth, maxHeight } = req.query;

  if (!photoReference) {
    return next(new AppError('Photo reference is required', StatusCodes.BAD_REQUEST));
  }

  try {
    const photoParams = {
      photoReference,
      maxWidth: maxWidth ? parseInt(maxWidth as string, 10) : 400,
      maxHeight: maxHeight ? parseInt(maxHeight as string, 10) : undefined
    };

    const photoStream = await getPlacePhotoStream(photoParams);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    // Pipe the photo stream to response
    photoStream.pipe(res);
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError('Failed to fetch photo', StatusCodes.INTERNAL_SERVER_ERROR));
  }
});