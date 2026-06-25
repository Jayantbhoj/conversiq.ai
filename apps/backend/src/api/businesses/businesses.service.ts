import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBusinessDto } from './dtos/create-business.dto';

@Injectable()
export class BusinessesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      include: { agents: true },
    });
  }

  async findOne(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: { agents: true },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return business;
  }

  async create(data: CreateBusinessDto) {
    const existing = await this.prisma.business.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException(`Business with email ${data.email} already exists`);
    }

    return this.prisma.business.create({
      data: {
        name: data.name,
        email: data.email,
      },
    });
  }
}
