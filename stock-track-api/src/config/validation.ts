import { plainToInstance, Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  PORT!: number;

  @IsString()
  @IsOptional()
  API_PREFIX!: string;

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN!: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  THROTTLE_TTL!: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT!: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed: ${errors.map((e) => Object.values(e.constraints || {}).join(', ')).join('; ')}`,
    );
  }

  return validatedConfig;
}
