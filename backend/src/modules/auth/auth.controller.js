import bcrypt from "bcrypt";
import prisma from "../../config/db.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.utils.js";
import {
  checkMultipleImages,
  cleanupS3Objects,
} from "../../utils/obscenity.util.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

export const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      role,
      dob,
      gender,
      name,
      loggedIn = false,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        dateOfBirth: dob,
        gender: gender,
      },
    });

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    if (loggedIn)
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.authProvider === "GOOGLE" ? "google" : "email",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, loggedIn = false } = req.body;
    console.log(req.body);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    if (loggedIn) console.log("loggedIn");
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Logged in successfully",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.authProvider === "GOOGLE" ? "google" : "email",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token missing",
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(payload);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const oAuthSuccess = async (req, res) => {
  try {
    const user = req.user;

    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const targetBase =
      process.env.FRONTEND_URL && process.env.FRONTEND_URL !== "*"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173";

    res.redirect(`${targetBase.replace(/\/$/, "")}/dashboard?accessToken=${accessToken}`);
  } catch (error) {
    console.error("OAuth success error:", error);
    res.status(500).json({
      message: "OAuth authentication failed",
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        if (decoded?.id) {
          await prisma.user.update({
            where: { id: decoded.id },
            data: { refreshToken: null },
          });
        }
      } catch {
        // Token invalid or already expired - proceed to clear cookie
      }
    }

    res.clearCookie("refreshToken", cookieOptions);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
