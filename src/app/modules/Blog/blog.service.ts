import prisma from "../../../shared/prisma";
const getSingleDonor = async (id: string) => {
  // console.log(data);

  const result = await prisma.blogs.findUniqueOrThrow({
    where: {
      id,
    },
  });
  return result;
};
const getAllBlogs = async () => {
  const result = await prisma.blogs.findMany();
  return result;
};
const createBlog = async (data: any) => {
  const result = await prisma.blogs.create({
    data,
  });
  return result;
};

export const BlogService = {
  getAllBlogs,
  getSingleDonor,
  createBlog,
};
