import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

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

  async findAll(paginationDto: PaginationDto) {
    const { limit, offset } = paginationDto;
    return await this.productRepository.find({
      skip: offset,
      take: limit
    })
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id: id })
    if( !product ) throw new NotFoundException(`product with id ${id} not found`);

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = this.findOne( id );
    await this.productRepository.delete({id: id});
    return product;
  }

  private handleExceptions( error: any) {
    if(error.code === '23505') 
    throw new BadRequestException(error.detail);
    console.log(error)
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check error logs')
  }
}
