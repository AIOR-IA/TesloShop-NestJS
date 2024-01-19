import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {

  }

  async create(createUserDto: CreateUserDto) {
    try {

      const { password, ...userData} = createUserDto;

      const user = await this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { password, email} = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true}
    });
    
    if( !user ) {
      throw new UnauthorizedException(`Credentials are not valid.`);
    }
    const isValidPassword = bcrypt.compareSync(password, user.password);
    
    if( !isValidPassword ) throw new UnauthorizedException(`Credentials are not valid.`);

    return user;

    // todo: return jwt

  }
  private handleDbErrors( error : any) {
    if(error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException('please check server logs');
  }
}
