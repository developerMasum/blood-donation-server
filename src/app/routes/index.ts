import express from "express";
import { UserRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { BlogRoutes } from "../modules/Blog/blog.routes";
import { DashboardRoutes } from "../modules/Dashboard/dashboard.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/login",
    route: AuthRoutes,
  },
  {
    path: "/",
    route: UserRoutes,
  },
  {
    path: "/blogs",
    route: BlogRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
