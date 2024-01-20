import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { QueryBuilder, Repository } from 'typeorm';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {

  }

  async executeSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();

    await this.insertProducts(adminUser);
    return `SEED EXECUTED`;
  }

  private async insertUsers () {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( user => {
      users.push(this.userRepository.create(user));
    })

    await this.userRepository.save(users);

    return users[0];
  }
  
  private async deleteTables() {
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()
  }

  private async insertProducts(user: User) {
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push(this.productService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true
  }

}
