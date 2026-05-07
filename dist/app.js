"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const events_routes_1 = __importDefault(require("./modules/events/events.routes"));
const discover_routes_1 = __importDefault(require("./modules/discover/discover.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const business_routes_1 = __importDefault(require("./modules/business/business.routes"));
const upload_routes_1 = __importDefault(require("./modules/upload/upload.routes"));
const app = (0, express_1.default)();
/*Middleware*/
// permite peticiones desde otros dominios
app.use((0, cors_1.default)());
// permite leer JSON en requests
app.use(express_1.default.json());
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/events", events_routes_1.default);
app.use("/api/v1/discover", discover_routes_1.default);
app.use("/api/v1/users", user_routes_1.default);
app.use("/api/v1/business", business_routes_1.default);
app.use("/api/v1/upload", upload_routes_1.default);
/*Health check endpoint*/
app.get("/", (req, res) => {
    res.json({
        message: "Veci API running",
    });
});
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
