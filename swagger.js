import  swaggerAutogen from 'swagger-autogen';
// import './app.js';

const doc = {
  info: {
    title: 'Bank API',
    description: 'Bank API documentation for you'
  },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['./routes/index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);