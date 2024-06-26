import {
  Donor,
  DonorProfile,
  Prisma,
  PrismaClient,
  User,
} from "@prisma/client";
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
  const hashedPassword: string = await bcrypt.hash(userData.password, 12);
  try {
    const result = await prisma.$transaction(async (tx) => {
      createdUser = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          profilePhoto: userData.profilePhoto,
        },
      });

      const { password, role, ...userWithoutPasswordAndRole } = createdUser;

      return { data: userWithoutPasswordAndRole };
    });

    return result;
  } catch (error) {
    // If an error occurs, handle it
    console.error("Error creating user:", error);
    throw new Error("Failed to create user.");
  }
};

const createDonorIntoDB = async (userData: any) => {
  let createDonor: Donor | null = null;
  let createdProfile: DonorProfile | null = null;
  let createdUser: User | null = null;
  const hashedPassword: string = await bcrypt.hash(userData.password, 12);

  try {
    const result = await prisma.$transaction(async (tx) => {
      createDonor = await tx.donor.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          bloodType: userData.bloodType,
          location: userData.location,
          availability: userData.availability,
        },
      });

      createdProfile = await tx.donorProfile.create({
        data: {
          donorId: createDonor.id,
          bio: userData.bio,
          age: userData.age,
          contactNumber: userData.contactNumber,
          profilePhoto: userData.profilePhoto,
          lastDonationDate: userData.lastDonationDate,
        },
      });
      createdUser = await tx.user.create({
        data: {
          id: createDonor.id,
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: "DONOR",
          profilePhoto: userData.profilePhoto,
        },
      });

      const { password, role, ...donnerWithoutPasswordAndRole } = createDonor;

      return {
        data: donnerWithoutPasswordAndRole,
        donnerProfile: createdProfile,
        user: createdUser,
      };
    });

    return result;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user.");
  }
};

// const getAllDonor = async (params: any, options: IPaginationOptions) => {
//   const { page, limit, skip } = paginationHelper.calculatePagination(options);
//   const { searchTerm, ...filterData } = params;

//   const andConditions: Prisma.DonorWhereInput[] = [];

//   //console.log(filterData);
//   if (params.searchTerm) {
//     andConditions.push({
//       OR: donorSearchAbleFields.map((field) => ({
//         [field]: {
//           contains: params.searchTerm,
//           mode: "insensitive",
//         },
//       })),
//     });
//   }

//   if (Object.keys(filterData).length > 0) {
//     andConditions.push({
//       AND: Object.keys(filterData).map((key) => ({
//         [key]: {
//           equals: (filterData as any)[key],
//         },
//       })),
//     });
//   }

//   const whereConditions: Prisma.DonorWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await prisma.donor.findMany({
//     where: whereConditions,
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? {
//             [options.sortBy]: options.sortOrder,
//           }
//         : {
//             createdAt: "desc",
//           },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       totalDonations: true,
//       bloodType: true,
//       location: true,
//       availability: true,
//       createdAt: true,
//       updatedAt: true,
//       DonorProfile: true,
//     },
//   });

//   const total = await prisma.donor.count({
//     where: whereConditions,
//   });

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: result,
//   };
// };

const getAllDonor = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.DonorWhereInput[] = [];

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

  const whereConditions: Prisma.DonorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const donors = await prisma.donor.findMany({
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
      totalDonations: true,
      bloodType: true,
      location: true,
      availability: true,
      createdAt: true,
      updatedAt: true,
      DonorProfile: {
        select: {
          lastDonationDate: true,
          contactNumber: true,
          profilePhoto: true,
        },
      },
    },
  });

  const today = new Date();

  // Update availability for donors with last donation more than 60 days ago
  for (const donor of donors) {
    const lastDonationDateStr = donor.DonorProfile?.lastDonationDate;
    const lastDonationDate = lastDonationDateStr
      ? new Date(lastDonationDateStr)
      : null;

    let daysSinceLastDonation: number | null = null;
    if (lastDonationDate) {
      daysSinceLastDonation = Math.floor(
        (today.getTime() - lastDonationDate.getTime()) / (1000 * 3600 * 24)
      );
    }

    // Ensure daysSinceLastDonation is not null before comparison
    if (daysSinceLastDonation !== null && daysSinceLastDonation > 60) {
      await prisma.donor.update({
        where: { id: donor.id },
        data: { availability: true },
      });
    }
  }

  const total = await prisma.donor.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: donors,
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
    // console.log(tokenId)

    const donor = await prisma.donor.findUnique({
      where: {
        id: data.donorId,
      },
      include: {
        DonorProfile: true,
      },
    });
    //  console.log(donor);

    if (!donor) {
      throw new Error("Donor not found");
    }

    const result = await prisma.requests.create({
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
        DonorProfile: donor.DonorProfile,
      },
    };

    return responseData;
  } catch (error) {
    throw new Error(`Error creating donation request: ${error}`);
  }
};

const getMyDonationRequest = async (token: string) => {
  const verifiedUser = jwtHelpers.verifyToken(
    token,
    config.jwt.jwt_secret as Secret
  );
  const userId = verifiedUser.id;
  console.log(userId);
  const result = await prisma.requests.findMany({
    where: {
      requesterId: userId,
    },
    include: {
      donor: {
        select: {
          name: true,

          bloodType: true,
          location: true,
          availability: true,
          totalDonations: true,
        },
      },
    },
  });
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
    const requestInfo = await prisma.requests.findMany({
      where: {
        donorId: userId,
      },
      include: {
        requester: {
          select: {
            name: true,
            email: true,

            profilePhoto: true,
          },
        },
      },
    });
    console.log("Request Information:", requestInfo);

    // If request information is available
    if (requestInfo.length > 0) {
      const requesterId = requestInfo[0].requesterId;
      console.log("Donor ID:", requesterId);

      // // Fetch user information based on the donorId
      // const donorInfo = await prisma.user.findUniqueOrThrow({
      //   where: {
      //     id: requesterId,
      //   },
      // });
      // console.log("Donor Information:", donorInfo);

      // Return both requestInfo and donorInfo
      return { requestInfo };
    } else {
      console.log("No requests found for this user.");
      return { requestInfo: [], donorInfo: null };
    }
  } catch (error) {
    console.error("Error occurred:", error);
    throw error; // Re-throw the error after logging it
  }
};

const updateRequestStatus = async (id: string, data: any) => {
  try {
    // Ensure 'prisma' is imported and accessible

    const result = await prisma.$transaction(async (tx) => {
      // Update the request status
      const donner = await tx.requests.update({
        where: {
          id,
        },
        data: {
          requestStatus: data,
        },
      });

      if (data === "APPROVED" && donner) {
        // Check if donner exists
        const d = await tx.donor.update({
          where: {
            id: donner.donorId,
          },
          data: {
            totalDonations: {
              increment: 1,
            },
            availability: {
              set: false,
            },
            DonorProfile: {
              update: {
                lastDonationDate: new Date().toISOString(),
              },
            },
          },
        });
        console.log(d);

        //  const profile =  await tx.donorProfile.update({
        //     where: {
        //       id: donner.donorId,
        //     },
        //     data: {
        //       lastDonationDate: new Date().toISOString(),
        //     },
        //   });
        //   console.log(profile)
      }
    });

    return result;
  } catch (error) {
    // Handle any errors that might occur during the transaction
    console.error("Error updating request status:", error);
    throw error; // Rethrow the error for the caller to handle
  }
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
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
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

  const result = await prisma.donorProfile.update({
    where: {
      id: userId,
    },
    data: userData,
  });

  return result;
};

const getSingleDonor = async (id: string) => {
  // console.log(data);

  const result = await prisma.donor.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      DonorProfile: true,
    },
  });
  return result;
};
const deleteUser = async (userId: string) => {
  try {
    // Step 1: Delete related records from the Request table
    await prisma.requests.deleteMany({
      where: {
        OR: [{ requesterId: userId }, { donorId: userId }],
      },
    });

    // Step 2: Delete related records from the UserProfile table
    await prisma.donorProfile.deleteMany({
      where: {
        id: userId,
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

const getAllRequest = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.RequestsWhereInput[] = [];

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

  const whereConditions: Prisma.RequestsWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.requests.findMany({
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
      phoneNumber: true,
      hospitalAddress: true,
      hospitalName: true,
      dateOfDonation: true,
      requestStatus: true,
      donor: {
        select: {
          name: true,
          email: true,
          bloodType: true,
          totalDonations: true,
          location: true,
          DonorProfile: {
            select: {
              age: true,
              lastDonationDate: true,
              contactNumber: true,
            },
          },
        },
      },
      requester: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const total = await prisma.requests.count({
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

export const userService = {
  createUserIntoDB,
  createDonorIntoDB,
  getAllDonor,
  createDonationRequest,
  getMyDonationRequest,
  updateRequestStatus,
  getMyProfile,
  updateMyProfile,
  getSingleDonor,
  requestedIGot,
  deleteUser,
  getAllRequest,
};
