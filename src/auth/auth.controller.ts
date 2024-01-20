import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders } from './decorators';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(
    @Body() loginUserDto:LoginUserDto
  ){
    return this.authService.loginUser(loginUserDto);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  TestingPrivateRoute(
    @Req() request:Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() header: IncomingHttpHeaders
  ) {
    return {
      ok: true,
      message: "valid token",
      user,
      userEmail,
      rawHeaders,
      header
    }
  }

  //using 2 decoratros to valid autorizacion role 
  @Get('private2')
  // @SetMetadata('roles', ['admin','super-user']),  RoleProtected = asigna el metadata
  @RoleProtected(ValidRoles.superUser, ValidRoles.user)
  // AuthGuard() = verifica la autenticacion, UserRoleGuard=verifica que el usuario tenga el rol del metadata
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user:User
  ){
    return user
  }

  @Get('private3')
  @Auth( ValidRoles.superUser)
  privateRoute3(
    @GetUser() user:User
  ){
    return user
  }
}
