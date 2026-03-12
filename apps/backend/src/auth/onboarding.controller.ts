import {
  Controller, Post, Get, Body, Query,
  UseGuards, Req, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { User } from '../users/user.entity';
import { UserPolicyAcceptance, UserIntent } from '../policies/user-policy-acceptance.entity';
import { EmailAuthService } from './email-auth.service';
import { validatePassword } from './password-validator';

@UseGuards(FirebaseAuthGuard)
@Controller('auth/onboarding')
export class OnboardingController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserPolicyAcceptance) private acceptanceRepo: Repository<UserPolicyAcceptance>,
    private emailAuthService: EmailAuthService,
  ) {}

  /**
   * GET /auth/onboarding/status — Check what the user still needs to complete
   */
  @Get('status')
  async getStatus(@Req() req: any, @Query('tenantId') tenantId: string) {
    const userId = req.user?.dbUserId || req.user?.uid;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    const emailVerified = !!user.email_verified_at;
    const mustChangePassword = !!user.must_change_password;

    // Check policy acceptance for the current tenant
    let policiesAccepted = false;
    if (tenantId) {
      const acceptance = await this.acceptanceRepo.findOne({
        where: { user_id: userId, tenant_id: tenantId, accepted_required: true },
        order: { accepted_at: 'DESC' },
      });
      policiesAccepted = !!acceptance;
    } else {
      policiesAccepted = !!user.policies_accepted_at;
    }

    return {
      emailVerified,
      mustChangePassword,
      policiesAccepted,
      email: user.email,
      displayName: user.display_name,
      complete: emailVerified && !mustChangePassword && policiesAccepted,
    };
  }

  /**
   * POST /auth/onboarding/send-verification — Send email verification code
   */
  @Post('send-verification')
  async sendVerification(@Req() req: any) {
    const userId = req.user?.dbUserId || req.user?.uid;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    if (user.email_verified_at) {
      return { success: true, message: 'Email already verified', alreadyVerified: true };
    }

    const result = await this.emailAuthService.sendOTP(user.email);
    return { success: true, otpKey: result.otpKey, expiresAt: result.expiresAt };
  }

  /**
   * POST /auth/onboarding/verify-email — Verify email with OTP code
   */
  @Post('verify-email')
  async verifyEmail(@Req() req: any, @Body() body: { otpKey: string; code: string }) {
    const userId = req.user?.dbUserId || req.user?.uid;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    if (!body.otpKey || !body.code) {
      throw new BadRequestException('otpKey and code are required');
    }

    await this.emailAuthService.verifyOTP(body.otpKey, body.code, user.email);
    await this.userRepo.update(userId, { email_verified_at: new Date() });

    // Mark email as verified in Firebase too
    try {
      const firebaseUser = await firebaseAdmin.auth().getUserByEmail(user.email);
      await firebaseAdmin.auth().updateUser(firebaseUser.uid, { emailVerified: true });
    } catch (e: any) {
      console.warn('Firebase email verification sync failed:', e.message);
    }

    return { success: true, message: 'Email verified successfully' };
  }

  /**
   * POST /auth/onboarding/set-password — Set new password (first login or reset)
   */
  @Post('set-password')
  async setPassword(@Req() req: any, @Body() body: { newPassword: string; currentPassword?: string }) {
    const userId = req.user?.dbUserId || req.user?.uid;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    if (!body.newPassword) {
      throw new BadRequestException('New password is required');
    }

    // Validate strong password
    const validation = validatePassword(body.newPassword);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join('. '));
    }

    // If not first login, verify current password
    if (!user.must_change_password && body.currentPassword) {
      if (!user.password_hash) {
        throw new BadRequestException('No password set. Use forgot password flow.');
      }
      const matches = await bcrypt.compare(body.currentPassword, user.password_hash);
      if (!matches) {
        throw new BadRequestException('Current password is incorrect');
      }
    }

    const hash = await bcrypt.hash(body.newPassword, 10);
    await this.userRepo.update(userId, {
      password_hash: hash,
      must_change_password: false,
    });

    // Sync password to Firebase
    try {
      const firebaseUser = await firebaseAdmin.auth().getUserByEmail(user.email);
      await firebaseAdmin.auth().updateUser(firebaseUser.uid, { password: body.newPassword });
    } catch (e: any) {
      console.warn('Firebase password sync failed:', e.message);
    }

    return { success: true, message: 'Password updated successfully' };
  }

  /**
   * POST /auth/onboarding/accept-policies — Accept platform/tenant policies
   */
  @Post('accept-policies')
  async acceptPolicies(
    @Req() req: any,
    @Body() body: {
      tenantId: string;
      role: string;
      consents: Record<string, any>;
    },
  ) {
    const userId = req.user?.dbUserId || req.user?.uid;
    if (!userId) throw new ForbiddenException('Not authenticated');

    if (!body.tenantId || !body.consents) {
      throw new BadRequestException('tenantId and consents are required');
    }

    const acceptance = await this.acceptanceRepo.save({
      user_id: userId,
      tenant_id: body.tenantId,
      intent: UserIntent.APP,
      role: body.role || req.user?.role || 'unknown',
      ip_address: req.ip || '0.0.0.0',
      user_agent: req.headers?.['user-agent'] || 'unknown',
      accepted_required: true,
      notifications_opt_in: !!body.consents.notifications,
      email_opt_in: !!body.consents.email,
      sms_opt_in: !!body.consents.sms,
      terms_version: body.consents.terms_version || '1.0',
      privacy_version: body.consents.privacy_version || '1.0',
      child_safety_version: body.consents.child_safety_version || '1.0',
      communications_version: body.consents.communications_version || '1.0',
    } as Partial<UserPolicyAcceptance>);

    // Also mark on user record
    await this.userRepo.update(userId, { policies_accepted_at: new Date() });

    return { success: true, acceptanceId: acceptance.id };
  }
}
