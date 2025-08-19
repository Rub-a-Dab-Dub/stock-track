import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name!: string;

  @ApiProperty()
  @Expose()
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  @Expose()
  get is_active(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  avatar_url?: string;

  @ApiPropertyOptional()
  department?: string;

  @ApiPropertyOptional()
  position?: string;

  @ApiPropertyOptional()
  employee_id?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  last_login_at?: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @Exclude()
  password_hash: string;

  @Exclude()
  password_reset_token: string;

  @Exclude()
  password_reset_expires_at: Date;
}
