import { SetMetadata } from '@nestjs/common';

export const SECURITY_ACTION_KEY = 'security_action';
export const SecurityAction = (action: string) => SetMetadata(SECURITY_ACTION_KEY, action);
