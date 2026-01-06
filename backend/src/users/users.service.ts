import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({ ...createUserDto, password: hashedPassword });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } }) ?? null;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  // New: search users by name (or list all if no query)
  async searchByName(q?: string): Promise<User[]> {
    if (!q || !q.trim()) {
      return this.usersRepository.find({ select: ['id', 'name'] });
    }
    return this.usersRepository.createQueryBuilder('user')
      .select(['user.id', 'user.name'])
      .where('LOWER(user.name) LIKE LOWER(:q)', { q: `%${q}%` })
      .getMany();
  }

  async existByIds(ids: number[]): Promise<number> {
    if (!ids?.length) return 0;
    return this.usersRepository.count({ where: { id: In(ids) } });
  }
}