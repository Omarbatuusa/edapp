import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'required_permission';

/**
 * Decorator to require a specific permission on an endpoint.
 * Usage: @RequirePermission('finance.journal.post')
 */
export const RequirePermission = (permission: string) => SetMetadata(PERMISSION_KEY, permission);
