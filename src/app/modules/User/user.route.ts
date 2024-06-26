import express, { NextFunction, Request, Response } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { UserRole } from "@prisma/client";
import { userValidation } from "./user.validation";
import { ZodError } from "../../Interfaces/errorSource";

const router = express.Router();



router.post(
  "/create-user",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      userValidation.createUser.parse(req.body);

      return userController.createUser(req, res, next);
    } catch (error: unknown) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as ZodError;
        const errorDetails = {
          issues: zodError.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        };
        const errorMessage = zodError.issues
          .map((issue) => issue.message)
          .join(". ");

        return res.status(400).json({
          success: false,
          message: errorMessage,
          errorDetails: errorDetails,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          error: (error as Error).message || "Unknown error occurred",
        });
      }
    }
  }
);
router.post(
  "/create-donor",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      userValidation.createDonor.parse(req.body);

      return userController.createDonor(req, res, next);
    } catch (error: unknown) {
      if (error instanceof Error && "issues" in error) {
        const zodError = error as ZodError;
        const errorDetails = {
          issues: zodError.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        };
        const errorMessage = zodError.issues
          .map((issue) => issue.message)
          .join(". ");

        return res.status(400).json({
          success: false,
          message: errorMessage,
          errorDetails: errorDetails,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          error: (error as Error).message || "Unknown error occurred",
        });
      }
    }
  }
);

router.get("/donor-list", userController.getAllDonor);
router.get("/donor/:id", userController.getSingleDonor);
router.post(
  "/donation-request",
  auth(UserRole.USER),
  userController.createDonationRequest
);

// -------------------
router.get(
  "/donation-request/my-requests",
  auth(UserRole.USER),
  userController.getMyDonationRequest
);
router.get(
  "/donation-request/got-requests",
  auth(UserRole.DONOR),
  userController.requestedIGot
);
router.post(
  "/update-status/:requestId",
  // auth(UserRole.ADMIN),
  userController.updateRequestStatus
);
// router.get("/users",  userController.getAllDonor);
router.get("/my-profile", auth(UserRole.USER), userController.getMyProfile);
router.put("/my-profile", auth(UserRole.USER), userController.updateMyProfile);
router.delete("/user/:id", userController.deleteUser);

router.get("/all-requests", userController.getAllRequest);





export const UserRoutes = router;
