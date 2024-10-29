import express from "express";
import { configureRoutes } from "./routes/index.js";

const app =  express();
const port = 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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