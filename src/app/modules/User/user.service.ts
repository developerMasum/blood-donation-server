import { Prisma, PrismaClient, User, UserProfile } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { IPaginationOptions } from "../../Interfaces/IPaginationOptions";
import { paginationHelper } from "../../../Helpers/paginationHelpers";
import { donorSearchAbleFields } from "./user.constants";
import { jwtHelpers } from "../../../Helpers/jwtHealpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";

const prisma = new PrismaClient();

const createUserIntoDB = async (userData: any) => {
  let createdUser: User | null = null;
  let createdProfile: UserProfile | null = null;
  const hashedPassword: string = await bcrypt.hash(userData.password, 12);
  try {
    const result = await prisma.$transaction(async (tx) => {
      createdUser = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
        
          bloodType: userData.bloodType,
          location: userData.location,

        },
      });

      createdProfile = await tx.userProfile.create({
        data: {
          userId: createdUser.id,
          bio: userData.bio,
          age: userData.age,
          contactNumber: userData.contactNumber ,
          profilePhoto: userData.profilePhoto,
          lastDonationDate: userData.lastDonationDate,
        },
      });

      const { password, role, ...userWithoutPasswordAndRole } = createdUser;



      return { data: userWithoutPasswordAndRole, userProfile:createdProfile };
    });

    return result;
  } catch (error) {
    // If an error occurs, handle it
    console.error("Error creating user:", error);
    throw new Error("Failed to create user.");
  }
};

const getAllDonor = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  //console.log(filterData);
  if (params.searchTerm) {
    andConditions.push({
      OR: donorSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      name: true,
      email: true,
      bloodType: true,
      location: true,
      availability: true,
      createdAt: true,
      updatedAt: true,
      UserProfile: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const createDonationRequest = async (token: string, data: any) => {
  // console.log(data, "data: ");
  try {
    const verifiedUser = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_secret as Secret
    );

    if (!verifiedUser || !verifiedUser.id) {
      throw new Error("Invalid token or user not found");
    }

    const tokenId = verifiedUser.id;
    console.log(tokenId)

    const donor = await prisma.user.findUnique({
      where: {
        id: data.donorId,
      },
      include: {
        UserProfile: true,
      },
    });
    //  console.log(donor);

    if (!donor) {
      throw new Error("Donor not found");
    }

    const result = await prisma.request.create({
      data: {
        donorId: data.donorId,
        requesterId: tokenId,
        phoneNumber: data.phoneNumber,
        dateOfDonation: data.dateOfDonation,
        hospitalName: data.hospitalName,
        hospitalAddress: data.hospitalAddress,
        reason: data.reason,
      },
    });

    // Construct the response object
    const responseData = {
      id: result.id,
      donorId: result.donorId,
      phoneNumber: result.phoneNumber,
      dateOfDonation: result.dateOfDonation,
      hospitalName: result.hospitalName,
      hospitalAddress: result.hospitalAddress,
      reason: result.reason,
      requestStatus: result.requestStatus,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      donor: {
        id: donor.id,
        name: donor.name,
        email: donor.email,
        bloodType: donor.bloodType,
        location: donor.location,
        availability: donor.availability,
        createdAt: donor.createdAt,
        updatedAt: donor.updatedAt,
        userProfile: donor.UserProfile,
      },
    };

    return responseData;
  } catch (error) {
    throw new Error(`Error creating donation request: ${error}`);
  }
};

const getMyDonationRequest = async (token:string) => {
  const verifiedUser = jwtHelpers.verifyToken(
    token,
    config.jwt.jwt_secret as Secret
  );
  const userId = verifiedUser.id;
  console.log(userId);
  const result = await prisma.request.findMany({
   where:{
    requesterId:userId
   },
 
  });
  // console.log(result);
  // const donnerInfo = await prisma.user.findUniqueOrThrow({
  //   where:{
  //     id:result?.donnerId
  //   }
  // })
  return result;
};
const requestedIGot = async (token: string) => {
  try {
    // Verify the token to get the user information
    const verifiedUser = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_secret as Secret
    );
    const userId = verifiedUser.id;
    console.log("Verified User ID:", userId);

    // Fetch request information where requesterId matches the userId
    const requestInfo = await prisma.request.findMany({
      where: {
        donorId: userId,
      },
    });
    console.log("Request Information:", requestInfo);

    // If request information is available
    if (requestInfo.length > 0) {
      const requesterId = requestInfo[0].requesterId;
      console.log("Donor ID:", requesterId);

      // Fetch user information based on the donorId
      const donorInfo = await prisma.user.findUniqueOrThrow({
        where: {
          id: requesterId,
        },
      });
      console.log("Donor Information:", donorInfo);

      // Return both requestInfo and donorInfo
      return { requestInfo, donorInfo };
    } else {
      console.log("No requests found for this user.");
      return { requestInfo: [], donorInfo: null };
    }
  } catch (error) {
    console.error("Error occurred:", error);
    throw error; // Re-throw the error after logging it
  }
};




const updateRequestStatus = async (id: string, data: string) => {
  // console.log(data);

  const result = await prisma.request.update({
    where: {
      id,
    },
    data: {
      requestStatus: data,
    },
  });
  return result;
};

const getMyProfile = async (token: any) => {
  const verifiedUser = jwtHelpers.verifyToken(
    token,
    config.jwt.jwt_secret as Secret
  );

  const userId = verifiedUser.id;
  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select:{
      id:true,
      name:true,
      email:true,
      bloodType:true,
      location:true,
      availability:true,
      createdAt:true,
      updatedAt:true,
      UserProfile: true,
    },
  });
  return result;
};



const updateMyProfile = async (token: string, userData: any) => {
  const verifiedUser = jwtHelpers.verifyToken(
    token,
    config.jwt.jwt_secret as Secret
  );

  const userId = verifiedUser.id;

  const result = await prisma.userProfile.update({
    where: {
      userId:userId
    },
    data: userData 
  });

  return result;
};

const getSingleDonor = async (id: string) => {
  // console.log(data);

  const result = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
    include:{
      UserProfile: true
    }

  });
  return result;
};
const deleteUser = async (userId: string) => {
  try {
    // Step 1: Delete related records from the Request table
    await prisma.request.deleteMany({
      where: {
        OR: [{ requesterId: userId }, { donorId: userId }],
      },
    });

    // Step 2: Delete related records from the UserProfile table
    await prisma.userProfile.deleteMany({
      where: {
        userId,
      },
    });

    // Step 3: Delete the user from the User table
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return {
      success: true,
      message: "User and related data deleted successfully",
    };
  } catch (error) {
    // Handle errors appropriately
    console.error("Error deleting user and related data:", error);
    throw error; // Rethrow the error for higher-level error handling
  }
};




export const userService = {
  createUserIntoDB,
  getAllDonor,
  createDonationRequest,
  getMyDonationRequest,
  updateRequestStatus,
  getMyProfile,
  updateMyProfile,
  getSingleDonor,
  requestedIGot,
  deleteUser,
};
