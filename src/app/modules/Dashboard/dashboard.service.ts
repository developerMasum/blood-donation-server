import prisma from "../../../shared/prisma";
type MonthWiseUpdate = {
  name: string;
  total: number;
};
const getDashboardCounts = async () => {
  const [donorCount, activeDonorCount, userCount, totalSuccessfulDonations] =
    await Promise.all([
      prisma.donor.count(),
      prisma.donor.count({
        where: {
          availability: true,
        },
      }),
      prisma.user.count(),
      prisma.requests.count({
        where: {
          requestStatus: "APPROVED",
        },
      }),
    ]);

  return {
    donorCount,
    activeDonorCount,
    userCount,
    totalSuccessfulDonations,
  };
};
const getMonthWiseDonation = async (): Promise<MonthWiseUpdate[]> => {
  const currentYear = new Date().getFullYear();

  const approvedRequests = await prisma.requests.findMany({
    where: {
      requestStatus: "APPROVED",
      updatedAt: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1),
      },
    },
    select: {
      updatedAt: true,
    },
  });

  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthWiseUpdates: { [key: string]: number } = approvedRequests.reduce(
    (acc: { [key: string]: number }, request) => {
      const month = new Date(request.updatedAt).toLocaleString("default", {
        month: "long",
      });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += 1;
      return acc;
    },
    {}
  );

  const sortedMonthWiseUpdates: MonthWiseUpdate[] = monthOrder.map((month) => ({
    name: month,
    total: monthWiseUpdates[month] || 0,
  }));

  return sortedMonthWiseUpdates;
};

const getMeritWiseDonors = async () => {
  const result = await prisma.donor.findMany({
    orderBy: {
      totalDonations: "desc",
    },
    take: 5,
    select: {
      name: true,
      email: true,
      bloodType: true,
      availability: true,
      totalDonations: true,
      DonorProfile: {
        select: {
          profilePhoto: true,
        },
      },
    },
  });
  return result;
};
const getDonationTimesWithNumber = async () => {
  const result = await prisma.donor.groupBy({
    by: ["totalDonations"],
    _count: {
      _all: true,
    },
    where: {
      totalDonations: {
        gt: 0,
      },
    },
  });

  return result.map((group) => ({
    times: group.totalDonations,
    numberOfPeople: group._count._all,
  }));
};
const getBestDonors = async () => {
  const result = await prisma.donor.findMany({
    orderBy: {
      totalDonations: "desc",
    },
    take: 5,
    select: {
      name: true,
      email: true,
      bloodType: true,
      availability: true,
      totalDonations: true,
      DonorProfile: {
        select: {
          profilePhoto: true,
        },
      },
    },
  });
  return result;
};

export const DashboardService = {
  getDashboardCounts,
  getMonthWiseDonation,
  getMeritWiseDonors,
  getDonationTimesWithNumber,
  getBestDonors,
};
