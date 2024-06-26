import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { BlogService } from "./blog.service";

const getSingleBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BlogService.getSingleDonor(id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: " single blog retrieved successfully!",
    data: result,
  });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getAllBlogs();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blogs retrieved successfully!",

    data: result,
  });
});
const createBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.createBlog(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blogs Created successfully!",

    data: result,
  });
});
export const BlogController = {
  getAllBlogs,
  getSingleBlog,
  createBlog,
};
