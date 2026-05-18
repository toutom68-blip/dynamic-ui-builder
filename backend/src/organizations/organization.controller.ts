import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './organization.dto';

import { AllowNoOrg } from '../common/decorators/scope.decorators';

@Controller('hyper-admin/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.HYPER_ADMIN)
@AllowNoOrg()
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get()
  findAll() {
    return this.orgService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const org = await this.orgService.findOne(id);
    const logoUrl = await this.orgService.getLogoUrl(org);
    return { ...org, logoUrl };
  }

  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.orgService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orgService.remove(id);
  }

  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file'))
  uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.orgService.setLogo(id, file);
  }
}
