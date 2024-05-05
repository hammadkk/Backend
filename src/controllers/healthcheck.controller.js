import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  const uptimeInSeconds = process.uptime();
  const responseTime = process.hrtime();
  const timestamp = Date.now();
  const environment = process.env.NODE_ENV || "development";

  const healthCheck = {
    environment,
    uptimeInSeconds,
    responseTime,
    timestamp,
    message: "OK",
  };

  try {
    return res
      .status(200)
      .json(new ApiResponse(200, healthCheck, "Health check successful."));
  } catch (error) {
    throw new ApiError(401, "Error in health check.");
  }
});

export { healthcheck };
