// server/src/api/apiRoutes.ts
import express from 'express';
import { searchPlaces, getPlacePhoto } from './apiController.js';
import { protect } from '../auth/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

/**
 * @swagger
 * /api/google/places:
 *   get:
 *     summary: Search for nearby places using Google Places API
 *     tags: [Google Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude coordinate
 *         example: 1.3521
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude coordinate
 *         example: 103.8198
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword (e.g., "Chinese restaurant")
 *         example: "Chinese restaurant"
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 2000
 *         description: Search radius in meters (max 50000)
 *         example: 2000
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           default: "restaurant"
 *         description: Place type filter
 *         example: "restaurant"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of results to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Places found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           place_id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           vicinity:
 *                             type: string
 *                           rating:
 *                             type: number
 *                           price_level:
 *                             type: integer
 *                           geometry:
 *                             type: object
 *                             properties:
 *                               location:
 *                                 type: object
 *                                 properties:
 *                                   lat:
 *                                     type: number
 *                                   lng:
 *                                     type: number
 *                     status:
 *                       type: string
 *                     total_results:
 *                       type: integer
 *                     returned_results:
 *                       type: integer
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/places', searchPlaces);

/**
 * @swagger
 * /api/google/photo/{photoReference}:
 *   get:
 *     summary: Get a place photo from Google Places API
 *     tags: [Google Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photoReference
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Places photo reference
 *       - in: query
 *         name: maxWidth
 *         schema:
 *           type: integer
 *           default: 400
 *         description: Maximum width of the photo
 *       - in: query
 *         name: maxHeight
 *         schema:
 *           type: integer
 *         description: Maximum height of the photo
 *     responses:
 *       200:
 *         description: Photo retrieved successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid photo reference
 *       404:
 *         description: Photo not found
 *       401:
 *         description: Unauthorized
 */
router.get('/photo/:photoReference', getPlacePhoto);

export default router;