import {Controller, Get, Request, Route, Security} from "tsoa";
import {UserRepository} from "../repositories/user.repository";
import express from "express";

@Route('/api/users')
export class UserController extends Controller {
    private userRepository: UserRepository = UserRepository.getInstance();

    @Get('current')
    @Security('token', ['user:current.read'])
    public async getCurrentUser(@Request() req: express.Request) {
        return req.securityContext ? req.securityContext.user : null;
    }

    ////////////////
    // Admin routes
    @Get('')
    @Security('token', ['user.read'])
    public async getAllUsers(@Request() req: express.Request) {
        return await this.userRepository.findAll();
    }
}