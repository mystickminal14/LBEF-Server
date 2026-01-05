import {User} from "@prisma/client";
import { Request } from "express";

export default interface SessionRequest<TParams={}, TResBody=any, TReqBody=any, TQuery={}>
    extends Request<TParams, TResBody, TReqBody, TQuery> {
    user?: User;
}