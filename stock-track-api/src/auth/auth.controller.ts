import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus 
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async register(@Body() registerDto: RegisterDto) {
    const tokens = await this.authService.register(registerDto);
    return {
      message: 'User registered successfully',
      ...tokens,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async login(@Request() req, @Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(req.user);
    return {
      message: 'Login successful',
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      },
      ...tokens,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    // Extract user ID from refresh token
    const decoded = this.authService['jwtService'].decode(refreshTokenDto.refreshToken) as any;
    if (!decoded?.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    const tokens = await this.authService.refreshTokens(decoded.sub, refreshTokenDto.refreshToken);
    return {
      message: 'Tokens refreshed successfully',
      ...tokens,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    await this.authService.logout(req.user.userId);
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async getProfile(@Request() req) {
    return {
      user: req.user,
    };
  }
}
