import express, { Express, Request, Response } from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes";
import eventsRoutes from "./modules/events/events.routes";
import discoverRoutes from "./modules/discover/discover.routes";
import usersRoutes from "./modules/users/user.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import businessRoutes from "./modules/business/business.routes";
import uploadRoutes from "./modules/upload/upload.routes";

const app: Express = express();

/*Middleware*/

// permite peticiones desde otros dominios
app.use(cors());

// permite leer JSON en requests
app.use(express.json());


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventsRoutes);
app.use("/api/v1/discover", discoverRoutes);

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/business", businessRoutes);
app.use("/api/v1/upload", uploadRoutes);

/*Health check endpoint*/
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Veci API running",
  });
});

app.use(errorMiddleware);

export default app;