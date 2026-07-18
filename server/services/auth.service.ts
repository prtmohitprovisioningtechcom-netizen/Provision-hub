import crypto from 'crypto';
import User, { IUserDocument } from '@/models/User';
import Company from '@/models/Company';
import LandingPage from '@/models/LandingPage';
import Settings from '@/models/Settings';
import Notification from '@/models/Notification';
import { connectDB } from '@/lib/mongodb';
import { hashPassword, comparePassword, generateToken } from '@/lib/auth';
import { sendEmail, verificationEmailHtml, resetPasswordEmailHtml } from '@/lib/email';
import { generateSlug } from '@/lib/utils';
import { DEFAULT_BUSINESS_HOURS, LANDING_SECTIONS } from '@/constants';
import { CompanyRegisterInput, LoginInput, RegisterInput, AdminRegisterInput } from '@/lib/validators';

export class AuthService {
  static async register(data: RegisterInput) {
    await connectDB();

    const existing = await User.findOne({ email: data.email });
    if (existing) throw new Error('Email already registered');

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: data.role,
      emailVerificationToken: verificationToken,
    });

    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: verificationEmailHtml(user.name, verificationToken),
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    };
  }

  static async registerCompany(data: CompanyRegisterInput) {
    await connectDB();

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new Error('Email already registered');

    const slug = generateSlug(data.name);
    const existingCompany = await Company.findOne({ slug });
    if (existingCompany) throw new Error('Company name already taken');

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name: data.ownerName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: 'company_admin',
      emailVerificationToken: verificationToken,
    });

    const company = await Company.create({
      name: data.name,
      slug,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      category: data.category,
      address: { country: data.country, state: data.state, city: data.city },
      description: data.description,
      website: data.website,
      socialLinks: data.socialLinks || {},
      gst: data.gst,
      pan: data.pan,
      businessHours: DEFAULT_BUSINESS_HOURS,
      ownerId: user._id,
      seo: {
        title: data.name,
        description: data.description || `Welcome to ${data.name}`,
        keywords: [data.category, data.city, data.name],
      },
    });

    user.companyId = company._id;
    await user.save();

    const sections = LANDING_SECTIONS.map((section, index) => ({
      ...section,
      id: `section-${index}`,
      content: '',
      isVisible: true,
      items: 'items' in section
        ? section.items.map((item) => ({ ...item }))
        : [],
    }));

    await LandingPage.create({ companyId: company._id, sections });
    await Settings.create({ companyId: company._id });

    await sendEmail({
      to: user.email,
      subject: 'Verify your email - Company Registration',
      html: verificationEmailHtml(user.name, verificationToken),
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: company._id.toString(),
    });

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: company._id.toString(),
        isEmailVerified: user.isEmailVerified,
      },
      company: {
        _id: company._id.toString(),
        name: company.name,
        slug: company.slug,
      },
      token,
    };
  }

  static async registerAdmin(data: AdminRegisterInput) {
    await connectDB();

    const existing = await User.findOne({ email: data.email });
    if (existing) throw new Error('Email already registered');

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
      role: 'super_admin',
      isEmailVerified: true,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
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

  static async login(data: LoginInput) {
    await connectDB();

    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user) throw new Error('Invalid email or password');

    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) throw new Error('Invalid email or password');

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: user.companyId?.toString(),
    });

    if (user.companyId) {
      await Notification.create({
        userId: user._id,
        companyId: user.companyId,
        type: 'new_login',
        title: 'New Login',
        message: `New login detected for ${user.email}`,
      });
    }

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId?.toString(),
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar,
      },
      token,
    };
  }

  static async verifyEmail(token: string) {
    await connectDB();
    const user = await User.findOne({ emailVerificationToken: token }).select(
      '+emailVerificationToken',
    );
    if (!user) throw new Error('Invalid or expired verification token');

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    return { message: 'Email verified successfully' };
  }

  static async forgotPassword(email: string) {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return { message: 'If email exists, reset link has been sent' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: resetPasswordEmailHtml(user.name, resetToken),
    });

    return { message: 'If email exists, reset link has been sent' };
  }

  static async resetPassword(token: string, password: string) {
    await connectDB();
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) throw new Error('Invalid or expired reset token');

    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  static async getMe(userId: string) {
    await connectDB();
    const user = await User.findById(userId)
      .populate('companyId', 'name slug logo status subscription')
      .lean();
    if (!user) throw new Error('User not found');

    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      companyId: user.companyId,
      createdAt: user.createdAt,
    };
  }
}
