import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './organization.dto';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/user.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const existing = await this.orgRepo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Slug '${dto.slug}' déjà utilisé`);
    }

    const org = this.orgRepo.create({
      name: dto.name,
      slug: dto.slug,
      primaryColor: dto.primaryColor ?? null,
      secondaryColor: dto.secondaryColor ?? null,
      cguContent: dto.cguContent ?? null,
      privacyContent: dto.privacyContent ?? null,
      loginTitle: dto.loginTitle ?? null,
      loginContent: dto.loginContent ?? null,
      contactEmail: dto.contactEmail ?? null,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.orgRepo.save(org);

    // Optionally create the admin user attached to this org
    if (dto.adminEmail && dto.adminPassword) {
      await this.userService.create({
        email: dto.adminEmail,
        password: dto.adminPassword,
        firstName: dto.adminFirstName || dto.name,
        lastName: dto.adminLastName || 'Admin',
        role: UserRole.ADMIN,
        organizationId: saved.id,
        isActive: true,
      } as any);
    }

    return saved;
  }

  findAll(): Promise<Organization[]> {
    return this.orgRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization introuvable');
    return org;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { slug } });
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.findOne(id);

    if (dto.slug && dto.slug !== org.slug) {
      const exists = await this.orgRepo.findOne({ where: { slug: dto.slug } });
      if (exists) throw new ConflictException(`Slug '${dto.slug}' déjà utilisé`);
    }

    Object.assign(org, dto);
    return this.orgRepo.save(org);
  }

  async remove(id: string): Promise<void> {
    const org = await this.findOne(id);
    await this.orgRepo.remove(org);
  }

  async setLogo(id: string, file: Express.Multer.File): Promise<Organization> {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    const org = await this.findOne(id);

    const prefix = process.env.AWS_S3_LOGOS_PREFIX || 'organizations/logos/';
    const folder = `${prefix}${id}`.replace(/\/+$/, '');

    const uploaded = await this.uploadService.uploadFile(file, folder);
    org.logoS3Key = uploaded.key;
    return this.orgRepo.save(org);
  }

  async getLogoUrl(org: Organization): Promise<string | null> {
    if (!org.logoS3Key) return null;
    try {
      return await this.uploadService.getSignedUrl(org.logoS3Key, 3600);
    } catch {
      return null;
    }
  }
}
