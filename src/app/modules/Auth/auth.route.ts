import express, { NextFunction, Request, Response } from "express";
import { AuthController } from "./auth.controller";



const router = express.Router();

router.post('/', AuthController.loginUser)
router.post(
  "/refresh-token",
//   validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthController.refreshToken
);

router.post(
  "/change-password",

  AuthController.changePassword
);

export const AuthRoutes = router;
