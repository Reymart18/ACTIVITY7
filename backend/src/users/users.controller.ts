import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../users/dto/auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user (simple)' })
  async register(@Body() createUserDto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(createUserDto.email);
    if (existing) return { message: 'Email already exists' };

    const user = await this.usersService.create(createUserDto);
    return { message: 'User registered', user: { id: user.id, email: user.email, name: user.name } };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user (simple)' })
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) return { message: 'Invalid credentials' };
    return { id: user.id, email: user.email, name: user.name };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'List users for task assignment' })
  async list(@Query('q') q?: string) {
    const users = await this.usersService.searchByName(q);
    return users.map(u => ({ id: u.id, name: u.name }));
  }
}
