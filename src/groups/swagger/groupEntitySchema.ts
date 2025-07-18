/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           example: "60d21b4667d0d8992e610c99"
 *         name:
 *           type: string
 *           example: "Jane's Group"
 *         code:
 *           type: string
 *           description: Randomly generated group code upon creation
 *           example: "cTbzX51e"
 *         users:
 *           type: array
 *           items:
 *             type: string
 *             example: "60d21b4667d0d8992e610c85"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-02T12:00:00Z"
 */

