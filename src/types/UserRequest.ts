// src/types/UserRequest.ts
import { Request } from "express";
import { EUserRole, EPermission } from "@prisma/client";

export default interface SessionRequest<
  TParams = {},
  TResBody = any,
  TReqBody = any,
  TQuery = {}
> extends Request<TParams, TResBody, TReqBody, TQuery> {
  user?: {
    id: number;
    fullname: string;
    username: string;
    email: string;
    role: EUserRole;
    permissions: EPermission[]; 
  };
}
