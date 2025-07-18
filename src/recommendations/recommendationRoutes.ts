import { Router } from 'express';
import {
    getGroupRecommendations,
    getPersonalRecommendations,
    getTopCuisines,
    predictRestaurantScore,
    submitRating,
} from './recommendationController.js'
import { protect } from '../auth/authController.js';

const router = Router();

router.use(protect);

router.get('/top-cuisines', getTopCuisines);
router.get('/personal', getPersonalRecommendations);
router.get('/group/:groupId', getGroupRecommendations);
router.get('/predict', predictRestaurantScore);
router.post('/ratings', submitRating);

export default router;