import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity.js';
import { Repository } from 'typeorm';

export interface AuthUser {
  sub: number;
  role: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  create(createOrderDto: CreateOrderDto, userId: number) {
    const order = this.ordersRepository.create({
      total: createOrderDto.total,
      user: { id: userId },
    });
    return this.ordersRepository.save(order);
  }

  findAll() {
    return this.ordersRepository.find();
  }

  findAllByUser(userId: number) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
    });
  }

  async findOne(id: number, user: AuthUser) {
    const order = await this.ordersRepository.findOne({
      where: user.role === 'admin' ? { id } : { id, user: { id: user.sub } },
    });
    if (!order) throw new NotFoundException(`Order #${id} không tồn tại`);
    return order;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  async remove(id: number, user: AuthUser) {
    await this.findOne(id, user); // không phải chủ đơn thì ném 404 ở đây
    return this.ordersRepository.delete(id);
  }
}
