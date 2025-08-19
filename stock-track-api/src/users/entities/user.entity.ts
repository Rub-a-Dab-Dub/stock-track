import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

@Entity('users')
@Index(['tenant_id', 'email'], { unique: true })
@Index(['tenant_id', 'status'])
@Index(['tenant_id', 'role'])
export class User extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude({ toPlainOnly: true })
  password_hash: string;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_login_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude({ toPlainOnly: true })
  password_reset_token: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  @Exclude({ toPlainOnly: true })
  password_reset_expires_at: Date;

  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'date', nullable: true })
  hire_date: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  employee_id: string;

  @Column({ type: 'json', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  bio: string;

  // Relationships
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
    id: any;
    created_at: any;
    updated_at: any;
    updated_by: number;

  // Virtual fields
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  get is_active(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  // Hash password before save
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password_hash && !this.password_hash.startsWith('$2a$')) {
      this.password_hash = await bcrypt.hash(this.password_hash, 12);
    }
  }

  // Method to verify password
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }
}
