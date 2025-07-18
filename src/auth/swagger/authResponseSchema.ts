/**
 * @swagger
 * components:
 *   schemas:
 *     UserWithTokenResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *       example:
 *         status: success
 *         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         data:
 *           user:
 *             id: "60d21b4667d0d8992e610c85"
 *             username: janetan
 *             email: janetan@example.com
 *             firstName: Jane
 *             lastName: Tan
 *             fullName: Jane Tan
 *             preferences:
 *               Chinese: 2
 *               Japanese: 1
 *               Korean: 0
 *             groups:
 *               - "60d21b4667d0d8992e610c99"
 *             createdAt: "2024-06-01T12:00:00Z"
 *             updatedAt: "2024-06-02T12:00:00Z"
 */
