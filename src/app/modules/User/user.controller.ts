import { Request, Response } from "express";

import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { userService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import { donorFilterableFields } from "./user.constants";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createUserIntoDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User Profile Created successful!",
    data: result,
  });
});
const createDonor = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createDonorIntoDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Donner Profile Created successful!",
    data: result,
  });
});

const getAllDonor = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.query)
  const filters = pick(req.query, donorFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await userService.getAllDonor(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: " All Donation requests retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const createDonationRequest = catchAsync(
  async (req: Request, res: Response) => {
    const authorization: string = req.headers.authorization || "";
    console.log(req.body, "body");
    const result = await userService.createDonationRequest(
      authorization,
      req.body
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Donation Request Created successful!",
      data: result,
    });
  }
);
const getMyDonationRequest = catchAsync(async (req: Request, res: Response) => {
  const authorization: string = req.headers.authorization || "";
  const result = await userService.getMyDonationRequest(authorization);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "My Donation requests retrieved successfully",
    data: result,
  });
});
const requestedIGot = catchAsync(async (req: Request, res: Response) => {
  const authorization: string = req.headers.authorization || "";
  const result = await userService.requestedIGot(authorization);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Donation requests retrieved successfully",
    data: result,
  });
});

const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const status = req.body.requestStatus;
  const params = req.params.requestId;
  // console.log("params",params);

  const result = await userService.updateRequestStatus(params, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation request status successfully updated!",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const authorization: string = req.headers.authorization || "";
  const result = await userService.getMyProfile(authorization);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My Profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const authorization: string = req.headers.authorization || "";
  const result = await userService.updateMyProfile(authorization, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User profile updated successfully!",
    data: result,
  });
});
const getSingleDonor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await userService.getSingleDonor(id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User profile updated successfully!",
    data: result,
  });
});
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await userService.deleteUser(id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User deleted successfully!",
    data: null,
  });
});

const getAllRequest = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.query)
  const filters = pick(req.query, donorFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await userService.getAllRequest(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: " All Donation requests retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});



export const userController = {
  createUser,
  createDonor,
  getAllDonor,
  createDonationRequest,
  getMyDonationRequest,
  updateRequestStatus,
  getMyProfile,
  updateMyProfile,
  getSingleDonor,
  deleteUser,
  requestedIGot,
  getAllRequest,

};
