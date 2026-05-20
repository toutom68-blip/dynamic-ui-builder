import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('mailing_list_entries')
@Unique('UQ_mailing_list_org_email', ['organizationId', 'email'])
export class MailingListEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  organizationId: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, nullable: true })
  name: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}