import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailingListEntry } from './mailing-list.entity';
import { CreateMailingListEntryDto, UpdateMailingListEntryDto, BulkMailingListEntryDto } from './mailing-list.dto';
import { User, UserRole } from '../user/user.entity';

@Injectable()
export class MailingListService {
  constructor(
    @InjectRepository(MailingListEntry)
    private readonly repo: Repository<MailingListEntry>,
  ) {}

  private ensureOrg(user: User): string {
    if (!user.organizationId) {
      throw new ForbiddenException("Aucune organisation associée à l'utilisateur");
    }
    return user.organizationId;
  }

  private ensureAdmin(user: User) {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.HYPER_ADMIN) {
      throw new ForbiddenException("Seul un administrateur peut modifier la liste de diffusion");
    }
  }

  async findAll(user: User): Promise<MailingListEntry[]> {
    const organizationId = this.ensureOrg(user);
    return this.repo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByOrg(organizationId: string): Promise<MailingListEntry[]> {
    if (!organizationId) return [];
    return this.repo.find({ where: { organizationId } });
  }

  async create(user: User, dto: CreateMailingListEntryDto): Promise<MailingListEntry> {
    this.ensureAdmin(user);
    const organizationId = this.ensureOrg(user);
    const email = dto.email.trim().toLowerCase();
    const existing = await this.repo.findOne({ where: { organizationId, email } });
    if (existing) {
      throw new BadRequestException(`L'email ${email} existe déjà dans la liste`);
    }
    const entry = this.repo.create({ organizationId, email, name: dto.name ?? null });
    return this.repo.save(entry);
  }

  async update(user: User, id: string, dto: UpdateMailingListEntryDto): Promise<MailingListEntry> {
    this.ensureAdmin(user);
    const organizationId = this.ensureOrg(user);
    const entry = await this.repo.findOne({ where: { id, organizationId } });
    if (!entry) throw new NotFoundException('Entrée introuvable');
    if (dto.email !== undefined) entry.email = dto.email.trim().toLowerCase();
    if (dto.name !== undefined) entry.name = dto.name;
    return this.repo.save(entry);
  }

  async remove(user: User, id: string): Promise<void> {
    this.ensureAdmin(user);
    const organizationId = this.ensureOrg(user);
    const entry = await this.repo.findOne({ where: { id, organizationId } });
    if (!entry) throw new NotFoundException('Entrée introuvable');
    await this.repo.remove(entry);
  }

  async bulkCreate(user: User, entries: BulkMailingListEntryDto[]): Promise<{ added: number; skipped: number }> {
    this.ensureAdmin(user);
    const organizationId = this.ensureOrg(user);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const existing = await this.repo.find({ where: { organizationId } });
    const existingSet = new Set(existing.map((e) => e.email.toLowerCase()));
    const toInsert: MailingListEntry[] = [];
    let skipped = 0;
    const seen = new Set<string>();
    for (const item of entries) {
      if (!item?.email) { skipped++; continue; }
      const email = item.email.trim().toLowerCase();
      if (!emailRe.test(email) || existingSet.has(email) || seen.has(email)) {
        skipped++;
        continue;
      }
      seen.add(email);
      toInsert.push(this.repo.create({ organizationId, email, name: item.name?.trim() || null }));
    }
    if (toInsert.length) await this.repo.save(toInsert);
    return { added: toInsert.length, skipped };
  }

  async getCcEmailsForOrg(organizationId: string | null | undefined): Promise<string[]> {
    if (!organizationId) return [];
    const list = await this.repo.find({ where: { organizationId } });
    return list.map((e) => e.email);
  }
}