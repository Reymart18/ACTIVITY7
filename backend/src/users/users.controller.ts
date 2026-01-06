import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../users/dto/auth/jwt-auth.guard';  

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(createUserDto.email);
    if (existing) return { message: 'Email already exists' };

    const user = await this.usersService.create(createUserDto);
    return { message: 'User registered', user: { id: user.id, email: user.email, name: user.name } };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) return { message: 'Invalid credentials' };
    return { id: user.id, email: user.email, name: user.name };
  }

  // New: list users for assignment (protected), with optional search
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Query('q') q?: string) {
    const users = await this.usersService.searchByName(q);
    // return minimal shape for assignment
    return users.map(u => ({ id: u.id, name: u.name }));
  }
}