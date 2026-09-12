import type { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as authService from "./auth.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions, maxAge: undefined });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 201, { user, accessToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 200, { user, accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const incoming = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!incoming) {
    throw AppError.unauthorized("No active session found.");
  }
  const { user, accessToken, refreshToken } = await authService.refreshSession(incoming);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, 200, { user, accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const incoming = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (incoming) {
    await authService.logout(incoming);
  }
  clearRefreshCookie(res);
  sendSuccess(res, 200, { loggedOut: true });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.getProfile(req.user!.id);
  sendSuccess(res, 200, { user: profile });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const profile = await authService.updateProfile(req.user!.id, req.body);
  sendSuccess(res, 200, { user: profile });
});
