import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt.utils.js";
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Unauthorized: token missing");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      error.statusCode = 401;
      error.message = "jwt expired";
    } else if (error.name === "JsonWebTokenError") {
      error.statusCode = 401;
      error.message = "invalid token";
    } else if (!error.statusCode) {
      error.statusCode = 401;
    }
    next(error);
  }
};
