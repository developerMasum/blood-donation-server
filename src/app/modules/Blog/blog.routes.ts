import express, { NextFunction, Request, Response } from "express";
import { BlogController } from "./blog.controller";

const router = express.Router();
router.post("/", BlogController.createBlog);
router.get("/", BlogController.getAllBlogs);
router.get("/:id", BlogController.getSingleBlog);
export const BlogRoutes = router;
