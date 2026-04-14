import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Request interface to include user data
// This prevents TypeScript from complaining about 'req.user'
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Get token from cookies (requires cookie-parser)
  const token = req.cookies.accessToken;

  // 2. If no token, access is denied
  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Access denied. Please log in to continue.",
    });
  }

  try {
    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      email: string;
    };

    // 4. Attach user info to the request object
    req.user = decoded;

    // 5. Move to the next middleware or controller
    next();
  } catch (error) {
    // 6. Handle expired or tampered tokens
    return res.status(403).json({
      status: "fail",
      message: "Invalid or expired session. Please log in again.",
    });
  }
};