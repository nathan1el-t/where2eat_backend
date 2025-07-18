/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: "janetan"
 *         email:
 *           type: string
 *           format: email
 *           example: "janetan@example.com"
 *         firstName:
 *           type: string
 *           example: "Jane"
 *         lastName:
 *           type: string
 *           example: "Tan"
 *
 *     UpdatePreferencesRequest:
 *       type: object
 *       properties:
 *         preferences:
 *           type: array
 *           description: List of cuisine preferences with points
 *           items:
 *             type: object
 *             required:
 *               - cuisine
 *               - points
 *             properties:
 *               cuisine:
 *                 type: string
 *                 example: "japanese"
 *               points:
 *                 type: number
 *                 example: 2
 *           example:
 *             - cuisine: "japanese"
 *               points: 2
 *             - cuisine: "thai"
 *               points: -1
 *             - cuisine: "italian"
 *               points: 0
 */
