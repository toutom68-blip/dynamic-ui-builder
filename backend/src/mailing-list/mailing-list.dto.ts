import { IsEmail, IsOptional, IsString, MaxLength, IsArray, ArrayMaxSize } from 'class-validator';

export class CreateMailingListEntryDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}

export class UpdateMailingListEntryDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}

export class BulkMailingListEntryDto {
  email: string;
  name?: string;
}

export class BulkCreateMailingListDto {
  @IsArray()
  @ArrayMaxSize(5000)
  entries: BulkMailingListEntryDto[];
}