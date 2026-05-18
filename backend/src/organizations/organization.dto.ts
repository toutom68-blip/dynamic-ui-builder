import {
  IsBoolean,
  IsEmail,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Le slug doit contenir uniquement des minuscules, chiffres et tirets',
  })
  @MinLength(2)
  @MaxLength(100)
  slug: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  cguContent?: string;

  @IsOptional()
  @IsString()
  privacyContent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  loginTitle?: string;

  @IsOptional()
  @IsString()
  loginContent?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  // Optional admin user created with the organization
  @IsOptional()
  @IsEmail()
  adminEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  adminPassword?: string;

  @IsOptional()
  @IsString()
  adminFirstName?: string;

  @IsOptional()
  @IsString()
  adminLastName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateOrganizationDto {
  @IsOptional() @IsString() @MaxLength(255) name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MinLength(2)
  @MaxLength(100)
  slug?: string;

  @IsOptional() @IsString() primaryColor?: string;
  @IsOptional() @IsString() secondaryColor?: string;
  @IsOptional() @IsString() cguContent?: string;
  @IsOptional() @IsString() privacyContent?: string;
  @IsOptional() @IsString() @MaxLength(255) loginTitle?: string;
  @IsOptional() @IsString() loginContent?: string;
  @IsOptional() @IsEmail() contactEmail?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
