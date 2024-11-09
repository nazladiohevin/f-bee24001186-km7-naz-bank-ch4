import express from "express";
import { configureRoutes } from "./src/routes/index.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" }

const app =  express();
const port = process.env.PORT || 3000;;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route settings
configureRoutes(app);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.isJoi) {
      res.status(400).json({
          message: err.message,
      });
  }

  res.status(500).json({
      message: 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})


export default app;