import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { CreateUserDto } from '../create-user.dto';
import { LoginUserDto } from '../login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) throw new BadRequestException('Email already exists');

    const user = await this.usersService.create(createUserDto);
    const token = this.jwtService.sign({ sub: user.id, email: user.email, name: user.name });

    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) throw new BadRequestException('Invalid email or password');

    const token = this.jwtService.sign({ sub: user.id, email: user.email, name: user.name });

    return { user: { id: user.id, name: user.name, email: user.email }, token };
  }
}