import {  Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { ContactListSchema } from "./contact.validation";
import { paginationSchema } from "../../validation/pagination.validation";

 const addContact = asyncHandler(async (req: Request, res: Response) => {
  const parsed = ContactListSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const { name, email, purpose, department } = parsed.data;
  const existingUser = await prismaClient.contact.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new ApiError(400, "User contact already exists!!");
  }

  const contact = await prismaClient.contact.create({
    data: { name, email, purpose, department },
  });
  return res
    .status(201)
    .json(new ApiResponse(201, contact, "User contact added successfully"));
});

const editUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name, email, purpose,department } = req.body;
  const checkUser = await prismaClient.contact.findUnique({
    where: { id: parseInt(id) },
  });
  if (!checkUser) throw new ApiError(404, "Contact not found");
  const updated = await prismaClient.contact.update({
    where: { id: parseInt(id) },
    data: {name, email, purpose,department  },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Contact updated successfully"));
});

const getContact = asyncHandler(async (req: Request, res: Response) => {
const parsed = paginationSchema.safeParse(req.query);
  
    if (!parsed.success) {
      throw new ApiError(400, "Validation Failed", parsed.error.issues);
    }
    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

  let search = req.query.search?.toString().toLowerCase().trim() || "";
  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search } },
          { purpose: { contains: search } },
          { email: { contains: search } },
          { department: { contains: search } },
        
        ],
      }
    : {};


  const users = await prismaClient.contact.findMany({
    where: searchFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.contact.count({
    where: searchFilter,
  });

  const totalPages = Math.ceil(total / limit);

  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, users, "Contact List fetched successfully", pagination)
    );
});
export const getAll = asyncHandler(async (req: Request, res: Response) => {


  const users = await prismaClient.contact.findMany({

    orderBy: { createdAt: "desc" },
  });

  

  

  return res
    .status(200)
    .json(
      new ApiResponse(200, users, "Contact List fetched successfully", )
    );
})

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = await prismaClient.contact.findUnique({
    where: { id: parseInt(id) },
  });
  if (!user) throw new ApiError(404, "user not found");

  await prismaClient.contact.delete({ where: { id: parseInt(id) } });
  res.status(200).json(new ApiResponse(200, null, "Contact List deleted successfully"));
});


export {
  getContact,
  editUser,addContact,
  deleteUser,
};
