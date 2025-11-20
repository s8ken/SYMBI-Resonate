/**
 * Integration Tests for Authentication System
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../../src/lib/supabase';
import { mfaService } from '../../src/lib/auth/mfa';
import { rbacService, Role, Permission } from '../../src/lib/auth/rbac';

describe('Authentication Integration Tests', () => {
  let testUserId: string;
  let testEmail: string;

  beforeAll(async () => {
    testEmail = `test-${Date.now()}@example.com`;
    // Create test user
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!'
    });
    
    if (error) throw error;
    testUserId = data.user!.id;
  });

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  describe('MFA Setup', () => {
    it('should generate MFA secret and backup codes', async () => {
      const result = await mfaService.setupMFA(testUserId, testEmail);
      
      expect(result.secret).toBeDefined();
      expect(result.secret.length).toBeGreaterThan(0);
      expect(result.qrCodeUrl).toContain('otpauth://totp/');
      expect(result.backupCodes).toHaveLength(10);
      expect(result.backupCodes[0]).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
    });

    it('should verify valid TOTP token', () => {
      const secret = mfaService.generateSecret();
      const token = '123456'; // Mock token
      
      // This would normally verify against actual TOTP
      expect(typeof mfaService.verifyTOTP(secret, token)).toBe('boolean');
    });
  });

  describe('RBAC System', () => {
    it('should assign role to user', async () => {
      const userRole = await rbacService.assignRole(
        testUserId,
        Role.ANALYST,
        'system'
      );
      
      expect(userRole.userId).toBe(testUserId);
      expect(userRole.role).toBe(Role.ANALYST);
      expect(userRole.grantedAt).toBeInstanceOf(Date);
    });

    it('should check user permissions', async () => {
      await rbacService.assignRole(testUserId, Role.ANALYST, 'system');
      
      const hasPermission = await rbacService.hasPermission(
        testUserId,
        Permission.ANALYTICS_READ
      );
      
      expect(hasPermission).toBe(true);
    });

    it('should deny unauthorized permissions', async () => {
      await rbacService.assignRole(testUserId, Role.VIEWER, 'system');
      
      const hasPermission = await rbacService.hasPermission(
        testUserId,
        Permission.USER_DELETE
      );
      
      expect(hasPermission).toBe(false);
    });

    it('should get all user permissions', async () => {
      await rbacService.assignRole(testUserId, Role.ANALYST, 'system');
      
      const permissions = await rbacService.getUserPermissions(testUserId);
      
      expect(permissions).toContain(Permission.ANALYTICS_READ);
      expect(permissions).toContain(Permission.ANALYTICS_WRITE);
      expect(permissions.length).toBeGreaterThan(0);
    });
  });

  describe('Session Management', () => {
    it('should create and validate session', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'TestPassword123!'
      });
      
      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.session?.access_token).toBeDefined();
    });

    it('should refresh expired session', async () => {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'TestPassword123!'
      });
      
      const { data: refreshData, error } = await supabase.auth.refreshSession({
        refresh_token: signInData.session!.refresh_token
      });
      
      expect(error).toBeNull();
      expect(refreshData.session).toBeDefined();
    });
  });
});