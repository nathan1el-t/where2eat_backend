/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *         username:
 *           type: string
 *           example: janetan
 *         email:
 *           type: string
 *           format: email
 *           example: janetan@example.com
 *         firstName:
 *           type: string
 *           example: Jane
 *         lastName:
 *           type: string
 *           example: Tan
 *         fullName:
 *           type: string
 *           description: Virtual field combining firstName and lastName
 *           example: Jane Tan
 *         preferences:
 *           type: object
 *           additionalProperties:
 *             type: number
 *           example:
 *             Chinese: 2
 *             Japanese: 1
 *             Korean: 0
 *         groups:
 *           type: array
 *           items:
 *             type: string
 *             example: "60d21b4667d0d8992e610c99"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-02T12:00:00Z"
 * 
 *     UserSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *         username:
 *           type: string
 *           example: janetan
 *         firstName:
 *           type: string
 *           example: Jane
 *         lastName:
 *           type: string
 *           example: Tan
 *         fullName:
 *           type: string
 *           description: Virtual field combining firstName and lastName
 *           example: Jane Tan
 */
