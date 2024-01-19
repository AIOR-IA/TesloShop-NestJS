import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from "@nestjs/common";
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository:Repository<User>,
        private readonly configService:ConfigService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }


    async validate( payload: JwtPayload):Promise<User> {

        const { email } = payload;

        const user = await this.userRepository.findOneBy({ email });

        if( !user ) throw new UnauthorizedException('Token invalid');

        if( !user.isActive ) throw new UnauthorizedException('User is Inactive, talk with an admin');
        
        return user;
    }
}