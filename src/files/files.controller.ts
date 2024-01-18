import { BadRequestException, Controller, Get, Param, Post,  Res,  UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';


@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}


  @Get('product/:imageName')
  findProductImage(
    @Res() res:Response,
    @Param('imageName') imageName: string
  ) {
    return this.filesService.getStaticProductImage(imageName);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('files', {
    fileFilter: fileFilter,
    // limits: { fileSize: 250 }
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductFile(
    @UploadedFile() file: Express.Multer.File) {
    if( !file ) throw new BadRequestException('Make sure that the file is an Image');
    const  secureUrl = `${ file.filename }`;
    return {
      secureUrl: secureUrl
    };
  }
}
