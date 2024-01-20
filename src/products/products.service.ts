import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { v4 as uuid} from 'uuid'
import { isUUID } from 'class-validator';
import { ProductImage } from './entities';
import { url } from 'inspector';
import { User } from 'src/auth/entities/user.entity';
@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly datasource: DataSource
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {

      const { images = [], ...productDetails } = createProductDto;

      const product =  this.productRepository.create({
        ...productDetails,
        images: images.map( img => this.productImageRepository.create({  url: img })),
        user: user
      });
      await this.productRepository.save(product);
      return {...product, images: images};
      
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 2 } = paginationDto;
    const products  = await this.productRepository.find({
      skip: offset,
      take: limit,
      relations: {
        images: true
      }
    })

    return products.map( ({images, ...product}) => {
      return {
         ...product,
         images: images.map( img => img.url)
      }
    })
  }

  async findOne(term: string) {
    
    let product: Product;

    if( isUUID(term)) {     
       product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(' UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }

    if( !product ) throw new NotFoundException(`product with id ${term} not found`);

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [] , ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map( img => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate })

    if( !product ) throw new NotFoundException(`Product with id ${id} not found`)

    const queryRunner = this.datasource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if( images ) {
        await queryRunner.manager.delete( ProductImage, {
          product: { id: id }
        })

        product.images = images.map(img => this.productImageRepository.create({ url: img }))
      }
      product.user = user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // await this.productRepository.save( product );
      return await this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleExceptions(error)
    }
  }
}
