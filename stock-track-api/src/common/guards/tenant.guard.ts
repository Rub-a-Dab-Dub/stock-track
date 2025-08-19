import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Extract tenant ID from headers, JWT token, or subdomain
    const tenantId = this.extractTenantId(request);
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    
    request.tenantId = tenantId;
    return true;
  }

  private extractTenantId(request: any): string | null {
    // Method 1: From header
    let tenantId = request.headers['x-tenant-id'];
    
    // Method 2: From JWT token (if using JWT)
    if (!tenantId && request.user) {
      tenantId = request.user.tenantId;
    }
    
    // Method 3: From subdomain
    if (!tenantId) {
      const host = request.headers.host;
      if (host) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
          tenantId = subdomain;
        }
      }
    }
    
    return tenantId;
  }
}
