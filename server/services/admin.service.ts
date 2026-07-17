import User from '@/models/User';
import Company from '@/models/Company';
import Lead from '@/models/Lead';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { connectDB } from '@/lib/mongodb';

export class AdminService {
  static async getDashboardStats() {
    await connectDB();

    const [totalUsers, totalCompanies, pendingCompanies, totalLeads, totalReviews] =
      await Promise.all([
        User.countDocuments(),
        Company.countDocuments(),
        Company.countDocuments({ status: 'pending' }),
        Lead.countDocuments(),
        Review.countDocuments(),
      ]);

    const recentCompanies = await Company.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name slug status createdAt')
      .lean();

    const companiesByCategory = await Company.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return {
      stats: {
        totalUsers,
        totalCompanies,
        pendingCompanies,
        totalLeads,
        totalReviews,
      },
      recentCompanies,
      companiesByCategory,
    };
  }

  static async getUsers(page = 1, limit = 20) {
    await connectDB();
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async createSuperAdmin() {
    await connectDB();
    const existing = await User.findOne({ role: 'super_admin' });
    if (existing) return existing;

    const { hashPassword } = await import('@/lib/auth');
    const user = await User.create({
      name: 'Super Admin',
      email: 'admin@tenanthub.com',
      password: await hashPassword('Admin@123'),
      role: 'super_admin',
      isEmailVerified: true,
    });
    return user;
  }
}
