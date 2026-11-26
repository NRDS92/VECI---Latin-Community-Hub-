import express, { Express, Request, Response } from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes";
import eventsRoutes from "./modules/events/events.routes";
import discoverRoutes from "./modules/discover/discover.routes";
import usersRoutes from "./modules/users/user.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import businessRoutes from "./modules/business/business.routes";
import communityRoutes from "./modules/community/community.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import adminRoutes from "./modules/admin/admin.routes";
import sitemapRoutes from "./shared/public-content/sitemap/sitemap.routes";
import publicContentRoutes
    from "./shared/public-content/resolver/public-content.routes";
import publicContentDiscoveryRoutes
    from "./shared/public-content/discovery/public-content.discovery.routes";
import { validatePasswordResetLandingUrl } from "./modules/auth/utils/password-reset-link";


const app: Express = express();

// Fail fast on a missing or unsafe reset-link destination instead of allowing
// account-dependent failures from the forgot-password endpoint.
validatePasswordResetLandingUrl();

// Trust only the immediate Render ingress hop. Do not trust an arbitrary
// forwarded chain; outside Render, use the socket address by default.
if (process.env.RENDER === "true") {
    app.set("trust proxy", 1);
}

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
app.use("/api/v1/communities", communityRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(
    "/api/v1/public",
    sitemapRoutes
);

app.use(
    "/api/v1/public/content",
    publicContentRoutes
);

app.use(
    "/api/v1/public",
    publicContentDiscoveryRoutes
);

/*Health check endpoint*/
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Veci API running",
  });
});

app.use(errorMiddleware);

export default app;
