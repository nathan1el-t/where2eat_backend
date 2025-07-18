/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *
 *     UserGroupsOnlyResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "60d21b4667d0d8992e610c85"
 *             groups:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *
 *     UserHistoryOnlyResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "60d21b4667d0d8992e610c85"
 *             history:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/History'
 *
 *     UserPreferencesOnlyResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "60d21b4667d0d8992e610c85"
 *             preferences:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *               example:
 *                 Chinese: 2
 *                 Japanese: 1
 *                 Korean: 0
 *
 *     UserSummaryResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/UserSummary'
 */
