import axios from 'axios';
import { config } from '../common/utils/config.js';
import { AppError } from '../common/utils/AppError.js';
import { StatusCodes } from 'http-status-codes';

export interface PlacesSearchParams {
  lat: number;
  lng: number;
  keyword?: string;
  radius?: number;
  type?: string;
}

export interface GooglePlace {
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
  business_status?: string;
}

export interface GooglePlacesResponse {
  results: GooglePlace[];
  status: string;
  next_page_token?: string;
  html_attributions: string[];
}

export interface PlacePhotoParams {
  photoReference: string;
  maxWidth?: number;
  maxHeight?: number;
}

export const searchNearbyPlaces = async (
  params: PlacesSearchParams
): Promise<GooglePlacesResponse> => {
  const {
    lat,
    lng,
    keyword = '',
    radius = 2000,
    type = 'restaurant'
  } = params;

  const location = `${lat},${lng}`;
  const key = config.GOOGLE_API_KEY;

  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  
  const searchParams = new URLSearchParams({
    location,
    radius: radius.toString(),
    type,
    key,
    ...(keyword && { keyword })
  });

  try {
    // console.log(url,searchParams);
    // console.log('searchparams',searchParams);
    const response = await axios.get<GooglePlacesResponse>(`${url}?${searchParams}`);
    // console.log(response.data);
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new AppError(
        `Google Places API error: ${response.data.status}`,
        StatusCodes.BAD_REQUEST
      );
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as any;
      const status = axiosError.response?.status || StatusCodes.INTERNAL_SERVER_ERROR;
      const message = axiosError.response?.data?.error_message || 'Google Places API request failed';
      
      throw new AppError(message, status);
    }

    throw new AppError(
      'An unexpected error occurred while fetching places',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const getPlacePhotoStream = async (
  params: PlacePhotoParams
): Promise<NodeJS.ReadableStream> => {
  const {
    photoReference,
    maxWidth = 400,
    maxHeight
  } = params;

  const key = config.GOOGLE_API_KEY;
  const url = 'https://maps.googleapis.com/maps/api/place/photo';
  
  const photoParams = new URLSearchParams({
    photo_reference: photoReference,
    maxwidth: maxWidth.toString(),
    key,
    ...(maxHeight && { maxheight: maxHeight.toString() })
  });

  try {
    const response = await axios.get(`${url}?${photoParams}`, {
      responseType: 'stream',
      timeout: 10000, // 10 second timeout
    });

    return response.data as NodeJS.ReadableStream;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
      const axiosError = error as any;
      const status = axiosError.response?.status || StatusCodes.INTERNAL_SERVER_ERROR;
      
      if (status === 404) {
        throw new AppError(
          'Photo not found or photo reference is invalid',
          StatusCodes.NOT_FOUND
        );
      }
      
      throw new AppError(
        `Failed to fetch photo: ${axiosError.message}`,
        status
      );
    }

    throw new AppError(
      'An unexpected error occurred while fetching photo',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};