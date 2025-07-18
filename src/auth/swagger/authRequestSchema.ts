/**
 * @swagger
 * components:
 *   schemas:
 *     SignupRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - passwordConfirm
 *         - firstName
 *         - lastName
 *       properties:
 *         username:
 *           type: string
 *           example: janetan
 *         email:
 *           type: string
 *           example: janetan@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: mySecurePass123
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           example: mySecurePass123
 *         firstName:
 *           type: string
 *           example: Jane
 *         lastName:
 *           type: string
 *           example: Tan
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - usernameOrEmail
 *         - password
 *       properties:
 *         usernameOrEmail:
 *           type: string
 *           example: janetan
 *         password:
 *           type: string
 *           format: password
 *           example: mySecurePass123
 *
 *     UpdatePasswordRequest:
 *       type: object
 *       required:
 *         - passwordCurrent
 *         - passwordNew
 *         - passwordConfirm
 *       properties:
 *         passwordCurrent:
 *           type: string
 *           format: password
 *           example: oldPass123
 *         passwordNew:
 *           type: string
 *           format: password
 *           example: newPass456
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           example: newPass456
 */
