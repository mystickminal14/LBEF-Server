import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { NewsSchema } from "./news.validation";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { deleteCourseImage } from "../../utils/deleteImage";
import { paginationSchema } from "../../validation/pagination.validation";

const add = asyncHandler(async (req: Request, res: Response) => {
  const parsed = NewsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
 const check = await prismaClient.news.findUnique({
  where: { link: parsed.data.link },
});

  if(check) throw new ApiError(400,"News with this link already exists");
  const newsDara = await prismaClient.news.create({
    data: parsed.data,
  });
  res
    .status(201)
    .json(new ApiResponse(201, newsDara, "News added successfully"));
});
const edit = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const parsed = NewsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const existing = await prismaClient.news.findUnique({
    where: { id },
  });

  if (!existing) throw new ApiError(404, "News not found");

  if (parsed.data.link && parsed.data.link !== existing.link) {
    const conflict = await prismaClient.news.findUnique({
      where: { link: parsed.data.link },
    });

    if (conflict && conflict.id !== id) {
      throw new ApiError(400, "Another news item already uses this link");
    }
  }

  const updated = await prismaClient.news.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      source: parsed.data.source,
      link: parsed.data.link,  
      publishedOn: parsed.data.publishedOn,
      publishedOnBS: parsed.data.publishedOnBS,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "News updated successfully"));
});

const getNews = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const news = await prismaClient.news.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.news.count();
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(200, news, "News fetched successfully", {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    })
  );
});
const uploadNews = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!req.file) throw new ApiError(400, "No image file provided");

  const filename = req.file.filename;
  const imageUrl = `/public/news/${filename}`;

  const news = await prismaClient.news.findUnique({
    where: { id: parseInt(id) },
  });

  if (news?.image) {
    throw new ApiError(400, "Image already exists");
  }

  if (!news) throw new ApiError(404, "news not found");

  const updatednews = await prismaClient.news.update({
    where: { id: parseInt(id) },
    data: { image: imageUrl },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatednews, "Image uploaded successfully"));
});
const updateNewsImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.file) throw new ApiError(400, "No image file provided");

  const news = await prismaClient.news.findUnique({ where: { id } });
  if (!news) throw new ApiError(404, "News not found");

  const filename = req.file.filename;
  const imageUrl = `/public/news/${filename}`;

  if (news.image) {
    deleteCourseImage(news.image);
  }

  const updatedCourse = await prismaClient.news.update({
    where: { id },
    data: { image: imageUrl },
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedCourse, "News image updated successfully")
    );
});
const deleteNews=asyncHandler(async(req:Request,res:Response)=>{
    const id=req.params.id;
    const news=await prismaClient.news.findUnique({where:{id:parseInt(id)}});    
    if(!news) throw new ApiError(404,"News not found");
     if (news.image) {
    deleteCourseImage(news.image);
  }
    await prismaClient.news.delete({where:{id:parseInt(id)}});
    res.status(200).json(new ApiResponse(200,null,"News deleted successfully"));
})

export { add,uploadNews,edit,deleteNews,updateNewsImage ,getNews};