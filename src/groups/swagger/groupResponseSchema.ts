/**
 * @swagger
 * components:
 *   schemas:
 *     GroupResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             group:
 *               $ref: '#/components/schemas/Group'

 *     GroupUsersOnlyResponse:
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
 *               example: "60d21b4667d0d8992e610c99"
 *             users:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'

 *     GroupHistoryOnlyResponse:
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
 *               example: "60d21b4667d0d8992e610c99"
 *             users:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/History'
 * 
 *     GroupWithUserCountResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             group:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "60d21b4667d0d8992e610c99"
 *                 name:
 *                   type: string
 *                   example: "Jane's Group"
 *                 code:
 *                   type: string
 *                   description: Randomly generated group code upon creation
 *                   example: "cTbzX51e"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-06-01T12:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-06-02T12:00:00Z"
 *                 userCount:
 *                   type: integer
 *                   example: 5
 * 
 *     GroupWithPopulatedUsersResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             group:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "60d21b4667d0d8992e610c99"
 *                 name:
 *                   type: string
 *                   example: "Jane's Group"
 *                 code:
 *                   type: string
 *                   example: "cTbzX51e"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-06-01T12:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-06-02T12:00:00Z"
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       username:
 *                         type: string
 *                         example: janetan
 *                       firstName:
 *                         type: string
 *                         example: Jane
 *                       lastName:
 *                         type: string
 *                         example: Tan
 * 
 *     GroupJoinLeaveResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             groupId:
 *               type: string
 *               example: "60d21b4667d0d8992e610c99"
 *             userId:
 *               type: string
 *               example: "60d21b4667d0d8992e610c85"
 */
