// @ts-nocheck
import crypto from 'crypto';
import pool from '@/lib/db';
import { hashPassword, comparePassword, generateToken } from '@/lib/auth';
import { sendEmail, verificationEmailHtml, resetPasswordEmailHtml } from '@/lib/email';
import { generateSlug } from '@/lib/utils';
import { DEFAULT_BUSINESS_HOURS, LANDING_SECTIONS } from '@/constants';
import { CompanyRegisterInput, LoginInput, RegisterInput, AdminRegisterInput } from '@/lib/validators';
import { RowDataPacket } from 'mysql2';

export class AuthService {
  static async register(data: RegisterInput) {
    const [existingUsers] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [data.email]);
    if (existingUsers.length > 0) throw new Error('Email already registered');

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const id = crypto.randomUUID();

    await pool.execute(
      'INSERT INTO users (id, name, email, password, phone, role, emailVerificationToken) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, data.name, data.email, hashedPassword, data.phone || null, data.role, verificationToken]
    );

    const [users] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id]);
    const user = users[0];

    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: verificationEmailHtml(user.name, verificationToken),
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    };
  }

  static async registerCompany(data: CompanyRegisterInput) {
    const [existingUsers] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [data.email]);
    if (existingUsers.length > 0) throw new Error('Email already registered');

    let slug = generateSlug(data.name);
    const [existingCompanies] = await pool.execute<RowDataPacket[]>('SELECT * FROM companies WHERE slug = ?', [slug]);
    
    if (existingCompanies.length > 0) {
      let addressInfo: any = {};
      try {
        const addressData = existingCompanies[0].address;
        addressInfo = typeof addressData === 'string' ? JSON.parse(addressData) : addressData;
      } catch (e) {}

      const isSameState = addressInfo?.state?.toLowerCase() === data.state?.toLowerCase();
      const isSameCity = addressInfo?.city?.toLowerCase() === data.city?.toLowerCase();

      if (isSameState && isSameCity) {
        throw new Error('This domain already exists');
      } else {
        slug = generateSlug(`${data.name}-${data.state || ''}-${data.city || ''}`);
        const [existingWithCity] = await pool.execute<RowDataPacket[]>('SELECT * FROM companies WHERE slug = ?', [slug]);
        if (existingWithCity.length > 0) {
          throw new Error('This domain already exists');
        }
      }
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const userId = crypto.randomUUID();
    const companyId = crypto.randomUUID();

    await pool.execute(
      'INSERT INTO users (id, name, email, password, phone, role, emailVerificationToken) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, data.ownerName, data.email, hashedPassword, data.phone, 'company_admin', verificationToken]
    );

    await pool.execute(
      'INSERT INTO companies (id, name, slug, ownerName, email, phone, category, address, description, website, socialLinks, gst, pan, businessHours, ownerId, seo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        companyId, data.name, slug, data.ownerName, data.email, data.phone, data.category,
        JSON.stringify({ country: data.country, state: data.state, city: data.city }),
        data.description || null, data.website || null, JSON.stringify(data.socialLinks || {}),
        data.gst || null, data.pan || null, JSON.stringify(DEFAULT_BUSINESS_HOURS), userId,
        JSON.stringify({
          title: data.name,
          description: data.description || `Welcome to ${data.name}`,
          keywords: [data.category, data.city, data.name],
        })
      ]
    );

    await pool.execute(
      'UPDATE users SET companyId = ? WHERE id = ?',
      [companyId, userId]
    );


    const sections = LANDING_SECTIONS.map((section, index) => ({
      ...section,
      id: `section-${index}`,
      content: '',
      isVisible: true,
      items: 'items' in section ? section.items.map((item) => ({ ...item })) : [],
    }));

    await pool.execute(
      'INSERT INTO landing_pages (id, companyId, sections) VALUES (?, ?, ?)',
      [crypto.randomUUID(), companyId, JSON.stringify(sections)]
    );

    await pool.execute(
      'INSERT INTO settings (id, companyId) VALUES (?, ?)',
      [crypto.randomUUID(), companyId]
    );

    await sendEmail({
      to: data.email,
      subject: 'Verify your email - Company Registration',
      html: verificationEmailHtml(data.ownerName, verificationToken),
    });

    const token = generateToken({
      userId: userId,
      email: data.email,
      role: 'company_admin',
      companyId: companyId,
    });

    return {
      user: {
        _id: userId,
        name: data.ownerName,
        email: data.email,
        role: 'company_admin',
        companyId: companyId,
        isEmailVerified: false,
      },
      company: {
        _id: companyId,
        name: data.name,
        slug: slug,
      },
      token,
    };
  }

  static async registerAdmin(data: AdminRegisterInput) {
    const [existingUsers] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [data.email]);
    if (existingUsers.length > 0) throw new Error('Email already registered');

    const hashedPassword = await hashPassword(data.password);
    const userId = crypto.randomUUID();

    await pool.execute(
      'INSERT INTO users (id, name, email, password, phone, role, isEmailVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, data.name, data.email, hashedPassword, data.phone || null, 'super_admin', true]
    );

    const token = generateToken({
      userId: userId,
      email: data.email,
      role: 'super_admin',
    });

    return {
      user: {
        _id: userId,
        name: data.name,
        email: data.email,
        role: 'super_admin',
        isEmailVerified: true,
      },
      token,
    };
  }

  static async loginAdmin(data: LoginInput) {
    const result = await this.login(data);
    if (result.user.role !== 'super_admin') {
      throw new Error('Access denied. Admin account required.');
    }
    return result;
  }

  static async resolveCompanyId(userId: string, existingCompanyId?: string | null) {
    if (existingCompanyId) return existingCompanyId;

    const [owned] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM companies WHERE ownerId = ? LIMIT 1',
      [userId],
    );
    const companyId = owned[0]?.id as string | undefined;
    if (!companyId) return undefined;

    await pool.execute(
      'UPDATE users SET companyId = ? WHERE id = ? AND (companyId IS NULL OR companyId = "")',
      [companyId, userId],
    );
    return companyId;
  }

  static async login(data: LoginInput) {
    const [users] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [data.email]);
    if (users.length === 0) throw new Error('Invalid email or password');
    const user = users[0];

    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) throw new Error('Invalid email or password');

    const companyId = await this.resolveCompanyId(user.id, user.companyId);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId,
    });

    if (companyId) {
      await pool.execute(
        'INSERT INTO notifications (id, userId, companyId, type, title, message) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), user.id, companyId, 'new_login', 'New Login', `New login detected for ${user.email}`]
      );
    }

    return {
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
      },
      token,
    };
  }

  static async verifyEmail(token: string) {
    const [users] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE emailVerificationToken = ?', [token]);
    if (users.length === 0) throw new Error('Invalid or expired verification token');
    const user = users[0];

    await pool.execute(
      'UPDATE users SET isEmailVerified = true, emailVerificationToken = NULL WHERE id = ?',
      [user.id]
    );

    return { message: 'Email verified successfully' };
  }

  static async forgotPassword(email: string) {
    const [users] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return { message: 'If email exists, reset link has been sent' };
    const user = users[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);

    await pool.execute(
      'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?',
      [resetToken, expires, user.id]
    );

    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: resetPasswordEmailHtml(user.name, resetToken),
    });

    return { message: 'If email exists, reset link has been sent' };
  }

  static async resetPassword(token: string, password: string) {
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > NOW()',
      [token]
    );
    if (users.length === 0) throw new Error('Invalid or expired reset token');
    const user = users[0];

    const hashedPassword = await hashPassword(password);

    await pool.execute(
      'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    return { message: 'Password reset successfully' };
  }

  static async getMe(userId: string) {
    const [users] = await pool.execute<RowDataPacket[]>(
      `SELECT u.*,
              COALESCE(u.companyId, owned.id) AS resolvedCompanyId,
              COALESCE(c.name, owned.name) AS company_name,
              COALESCE(c.slug, owned.slug) AS company_slug,
              COALESCE(c.logo, owned.logo) AS company_logo,
              COALESCE(c.status, owned.status) AS company_status,
              COALESCE(c.subscription, owned.subscription) AS company_subscription
       FROM users u
       LEFT JOIN companies c ON c.id = u.companyId
       LEFT JOIN companies owned ON owned.ownerId = u.id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );
    if (users.length === 0) throw new Error('User not found');
    const user = users[0];

    const resolvedCompanyId = user.resolvedCompanyId as string | null;
    if (resolvedCompanyId && !user.companyId) {
      await pool.execute(
        'UPDATE users SET companyId = ? WHERE id = ? AND (companyId IS NULL OR companyId = "")',
        [resolvedCompanyId, userId],
      );
    }

    let companyData = null;
    if (resolvedCompanyId) {
      companyData = {
        _id: resolvedCompanyId,
        name: user.company_name,
        slug: user.company_slug,
        logo: user.company_logo,
        status: user.company_status,
        subscription: user.company_subscription,
      };
    }

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: Boolean(user.isEmailVerified),
      companyId: companyData,
      createdAt: user.createdAt,
    };
  }
}
