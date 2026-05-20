import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailingListEntry } from './mailing-list.entity';
import { MailingListService } from './mailing-list.service';
import { MailingListController } from './mailing-list.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MailingListEntry])],
  controllers: [MailingListController],
  providers: [MailingListService],
  exports: [MailingListService],
})
export class MailingListModule {}