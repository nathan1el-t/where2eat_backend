import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Food Recommendation API',
      version: '1.0.0',
      description:
        'This API powers a food recommendation system based on individual and group preferences.' +
        ' Users can create accounts, join groups, and receive personalized or group-based food suggestions.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './users/**/*.js',
    './groups/**/*.js',
    './history/**/*.js',
    './auth/**/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
