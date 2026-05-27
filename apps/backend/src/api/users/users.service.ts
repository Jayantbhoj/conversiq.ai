import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    { id: '1', name: 'Anna Example', email: 'anna@example.com' }
  ];

  findAll(): User[] {
    return this.users;
  }

  create(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      name: createUserDto.name,
      email: createUserDto.email
    };

    this.users.push(newUser);
    return newUser;
  }
}
