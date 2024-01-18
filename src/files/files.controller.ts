import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FilesService } from './files.service';


@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  uploadProductFile(file: Express.Multer.File) {
    return 'upload file'
  }
}
