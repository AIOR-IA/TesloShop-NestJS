import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {

      const product =  this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
      
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll() {
    return `This action returns all products`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handleExceptions( error: any) {
    if(error.code === '23505') 
    throw new BadRequestException(error.detail);
    console.log(error)
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check error logs')
  }
}
