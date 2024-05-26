import express from "express";
import { UserRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.route";


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
  
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
