import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { jwtHelpers } from "../../../Helpers/jwtHealpers";
import config from "../../../config";

// const loginUser = async (payload: {
//     email: string,
//     password: string
// }) => {
//     const userData = await prisma.user.findUniqueOrThrow({
//         where: {
//             email: payload.email,

//         }
//     });

//     const isCorrectPassword: boolean = await bcrypt.compare(payload.password, userData.password);

//     if (!isCorrectPassword) {
//         throw new Error("Password incorrect!")
//     }
//     const accessToken = jwtHelpers.generateToken({
//         id: userData.id,
//         name:userData.name,
//         email: userData.email,
//         role: userData.role,
//     },
//         "accessToken",
//         "30d"
//     );

//     return {
//         id: userData.id,
//         name: userData.name,
//         email:userData.email,
//         accessToken,

//     };
// };

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }
  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    refreshToken,
    id: userData.id,
    name: userData.name,
    email: userData.email,
    accessToken,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
    
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
      id:userData.id
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken,
 
  };
};

const changePassword = async (token: any, payload: any) => {

    const user = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_secret as Secret
    );
 
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: user.email,
    },
  });
  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new Error("Password is  Wrong");
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);
  await prisma.user.update({
    where: {
      email: userData.email,
     
    },
    data: {
      password: hashedPassword,
     
    },
  });
  return {
    message: "password changed Successfully",
  };
};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
};
