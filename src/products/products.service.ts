import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { v4 as uuid} from 'uuid'
import { isUUID } from 'class-validator';
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

  async findOne(term: string) {
    
    let product: Product;

    if( isUUID(term)) {     
       product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where(' UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase()
        }).getOne();
    }

    if( !product ) throw new NotFoundException(`product with id ${term} not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });

    if( !product ) throw new NotFoundException(`Product with id ${id} not found`)
    
    try {
      await this.productRepository.save( product );
      return product;

    } catch (error) {
      this.handleExceptions(error);
    }
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
