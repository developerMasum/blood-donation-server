import express, { NextFunction, Request, Response } from "express";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();
router.get("/count", DashboardController.getDashboardCounts);
router.get("/count-monthly", DashboardController.getMonthWiseDonation);
router.get("/donor-merit-wise", DashboardController.getMeritWiseDonors);
router.get("/donations-time", DashboardController.getDonationTimesWithNumber);
router.get("/best-donors", DashboardController.getBestDonors);

export const DashboardRoutes = router;
