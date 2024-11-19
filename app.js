import "./src/config/sentry/instrument.js";
import express from "express";
import { configureRoutes } from "./src/routes/index.js";
import * as Sentry from "@sentry/node";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" }
import expressEjsLayouts from "express-ejs-layouts";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const app =  express();
const port = process.env.PORT || 3000;;
const server = createServer(app);
const io = new Server(server);

export { io }

// EJS View Engine
app.set("views", path.join("./src/views"));
app.set('view engine', 'ejs');
app.use(expressEjsLayouts);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route settings
configureRoutes(app);

// Setup Sentry
Sentry.setupExpressErrorHandler(app);

// Web Socket
io.on('connection', (socket) => {
  console.log('a user connected');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.isJoi) {
      res.status(400).json({
          message: err.message,
      });
  }

  if (err) {
    return res.status(500).json({
      message: err.message,
  });
  }

  res.status(500).json({
      message: 'Internal server error',
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})


export default app;