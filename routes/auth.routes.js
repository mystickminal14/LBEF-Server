"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const auth_controller_1 = require("../api/auth/auth.controller");
const authRoutes = (0, express_1.Router)();
authRoutes.post('/login', auth_controller_1.login);
authRoutes.get('/me', [auth_middleware_1.default], auth_controller_1.me);
authRoutes.delete('/logout', auth_controller_1.logout);
exports.default = authRoutes;
