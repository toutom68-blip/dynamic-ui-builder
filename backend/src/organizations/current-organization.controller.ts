import { Controller, Get, UseGuards, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../user/user.entity';
import { OrganizationService } from './organization.service';

/**
 * Returns the current authenticated user's organization (with signed logo URL).
 * Hyper-admins have no organization and will receive null.
 */
@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class CurrentOrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get('current')
  async getCurrent(@CurrentUser() user: User) {
    if (!user?.organizationId) return null;
    const org = await this.orgService.findOne(user.organizationId).catch(() => null);
    if (!org) throw new NotFoundException('Organisation introuvable');
    const logoUrl = await this.orgService.getLogoUrl(org);
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl,
      primaryColor: org.primaryColor,
      secondaryColor: org.secondaryColor,
    };
  }
}