import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { REQUEST } from '@nestjs/core';
// import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedUsersResponseDto } from './dto/paginated-users-response.dto';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(REQUEST)
    private readonly request: {
      tenantId: number;
      user?: { id: number; role?: string };
    },
  ) {}

  private getTenantId(): number {
    return this.request.tenantId;
  }

  private getCurrentUserId(): number | undefined {
    return this.request.user?.id;
  }

  private getBaseQuery(): SelectQueryBuilder<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.tenant_id = :tenantId', { tenantId: this.getTenantId() });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.getBaseQuery()
      .andWhere('user.email = :email', { email: email.toLowerCase() })
      .getOne();

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.userRepository.create({
      ...userData,
      email: email.toLowerCase(),
      password_hash: password,
      tenant: this.getTenantId(), // Use 'tenant' if that's the correct field in User entity
      // Remove created_by if not present in User entity, or rename to match the entity field
    });

    return this.userRepository.save(user);
  }

  async findAll(queryDto: UserQueryDto): Promise<PaginatedUsersResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      department,
      sort_by,
      sort_order,
    } = queryDto;
    const offset = (page - 1) * limit;

    let query = this.getBaseQuery();

    // Apply search filter
    if (search) {
      query = query.andWhere(
        '(user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.email ILIKE :search OR user.employee_id ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply filters
    if (role) {
      query = query.andWhere('user.role = :role', { role });
    }

    if (status) {
      query = query.andWhere('user.status = :status', { status });
    }

    if (department) {
      query = query.andWhere('user.department ILIKE :department', {
        department: `%${department}%`,
      });
    }

    // Apply sorting
    const validSortFields = [
      'first_name',
      'last_name',
      'email',
      'created_at',
      'last_login_at',
    ];
    const sortField = validSortFields.includes(sort_by ?? '')
      ? (sort_by ?? 'created_at')
      : 'created_at';
    query = query.orderBy(`user.${sortField}`, sort_order);

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    const users = await query.skip(offset).take(limit).getMany();

    // Map User entities to UserResponseDto
    const userDtos = users.map((user) => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      employee_id: user.employee_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login_at: user.last_login_at,
      full_name: `${user.first_name} ${user.last_name}`,
      is_active: user.status === UserStatus.ACTIVE,
      password_hash: user.password_hash,
      password_reset_token: user.password_reset_token,
      password_reset_expires_at: user.password_reset_expires_at,
    }));

    const total_pages = Math.ceil(total / limit);

    return {
      data: userDtos,
      total,
      page,
      limit,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.getBaseQuery()
      .andWhere('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.getBaseQuery()
      .andWhere('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    Object.assign(user, {
      ...updateUserDto,
      email: updateUserDto.email?.toLowerCase(),
      updated_by: this.getCurrentUserId(),
    });

    return this.userRepository.save(user);
  }

  async updateProfile(
    id: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const currentUserId = this.getCurrentUserId();

    // Users can only update their own profile unless they're admin
    if (id !== currentUserId && !this.isAdmin()) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.update(id, updateProfileDto);
  }

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const currentUserId = this.getCurrentUserId();

    // Users can only change their own password
    if (id !== currentUserId) {
      throw new ForbiddenException('You can only change your own password');
    }

    const user = await this.findOne(id);
    const { current_password, new_password } = changePasswordDto;

    // Verify current password
    const isCurrentPasswordValid =
      await user.validatePassword(current_password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    user.password_hash = new_password;
    user.updated_by = currentUserId;
    await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await this.findOne(id);

    // Prevent self-deletion
    if (id === this.getCurrentUserId()) {
      throw new BadRequestException('You cannot delete your own account');
    }

    await this.userRepository.softDelete(id);
  }

  async activate(id: number): Promise<User> {
    const user = await this.findOne(id);

    user.status = UserStatus.ACTIVE;
    const currentUserId = this.getCurrentUserId();
    user.updated_by = typeof currentUserId === 'number' ? currentUserId : 0;

    return this.userRepository.save(user);
  }

  async deactivate(id: number): Promise<User> {
    const user = await this.findOne(id);

    // Prevent self-deactivation
    if (id === this.getCurrentUserId()) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    user.status = UserStatus.INACTIVE;
    user.updated_by = this.getCurrentUserId() ?? 0;

    return this.userRepository.save(user);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(
      { id, tenant: this.getTenantId() },
      { last_login_at: new Date() },
    );
  }

  private isAdmin(): boolean {
    const userRole = this.request.user?.role ?? '';
    return ['super_admin', 'admin'].includes(userRole);
  }

  // Bulk operations
  async bulkActivate(ids: number[]): Promise<void> {
    await this.userRepository.update(
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: In(ids),
        tenant: this.getTenantId(),
      },
      {
        status: UserStatus.ACTIVE,
        updated_by: this.getCurrentUserId(),
        updated_at: new Date().toISOString(),
      },
    );
  }

  async bulkDeactivate(ids: number[]): Promise<void> {
    // Remove current user from the list to prevent self-deactivation
    const currentUserId = this.getCurrentUserId();
    const filteredIds = ids.filter((id) => id !== currentUserId);

    if (filteredIds.length > 0) {
      await this.userRepository.update(
        {
          id: { $in: filteredIds } as any,
          tenant: this.getTenantId(),
        },
        {
          status: UserStatus.INACTIVE,
          updated_by: currentUserId,
          updated_at: new Date().toISOString(),
        },
      );
    }
  }

  async getUserStats() {
    const tenantId = this.getTenantId();

    const [total, active, inactive, pending] = await Promise.all([
      this.userRepository.count({ where: { tenant: tenantId } }),
      this.userRepository.count({
        where: { tenant: tenantId, status: UserStatus.ACTIVE },
      }),
      this.userRepository.count({
        where: { tenant: tenantId, status: UserStatus.INACTIVE },
      }),
      this.userRepository.count({
        where: { tenant: tenantId, status: UserStatus.PENDING },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      pending,
      active_percentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }
}
