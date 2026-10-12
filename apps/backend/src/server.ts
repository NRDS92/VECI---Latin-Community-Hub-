
import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { connectDB } from "./config/database";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on("error", (error) => {
      console.error("HTTP server failed to start:", error.message);
      process.exit(1);
    });
  } catch (error: unknown) {
    console.error(
      "Failed to start server:",
      error instanceof Error ? error.message : "Unknown error"
    );

    process.exit(1);
  }
};

void startServer();
