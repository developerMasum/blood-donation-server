import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { DashboardService } from "./dashboard.service";

const getDashboardCounts = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getDashboardCounts();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard counts retrieved successfully!",
    data: result,
  });
});
const getMonthWiseDonation = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getMonthWiseDonation();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "monthly donation counts retrieved successfully!",
    data: result,
  });
});
const getMeritWiseDonors = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getMeritWiseDonors();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "MeritWiseDonors  counts retrieved successfully!",
    data: result,
  });
});
const getDonationTimesWithNumber = catchAsync(
  async (req: Request, res: Response) => {
    const result = await DashboardService.getDonationTimesWithNumber();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Donation Times With Number  counts retrieved successfully!",
      data: result,
    });
  }
);
const getBestDonors = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.getBestDonors();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "best donners retrieved successfully!",
    data: result,
  });
});

export const DashboardController = {
  getDashboardCounts,
  getMonthWiseDonation,
  getMeritWiseDonors,
  getDonationTimesWithNumber,
  getBestDonors,
};
