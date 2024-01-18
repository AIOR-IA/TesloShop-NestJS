import { BadRequestException, Controller, Post,  UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';


@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FileInterceptor('files', {
    fileFilter: fileFilter
  }))
  uploadProductFile(
    @UploadedFile() file: Express.Multer.File) {
    if( !file ) throw new BadRequestException('Make sure that the file is an Image');
    return {
      fileName: file.originalname
    };
  }
}
