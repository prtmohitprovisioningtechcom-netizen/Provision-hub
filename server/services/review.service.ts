import Review from '@/models/Review';
import Company from '@/models/Company';
import Notification from '@/models/Notification';
import { connectDB } from '@/lib/mongodb';
import { getPaginationMeta } from '@/lib/utils';

export class ReviewService {
  static async create(data: {
    companyId: string;
    userId: string;
    customerName: string;
    rating: number;
    comment: string;
    images?: string[];
  }) {
    await connectDB();

    const company = await Company.findById(data.companyId);
    if (!company) throw new Error('Company not found');

    const review = await Review.create({ ...data, status: 'pending' });

    await Notification.create({
      userId: company.ownerId,
      companyId: company._id,
      type: 'new_review',
      title: 'New Review',
      message: `${data.customerName} left a ${data.rating}-star review`,
      link: '/dashboard/reviews',
    });

    return review;
  }

  static async getByCompany(companyId: string, page = 1, limit = 20, status?: string) {
    await connectDB();
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = { companyId };
    if (status) query.status = status;

    const [reviews, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(query),
    ]);

    return { reviews, pagination: getPaginationMeta(page, limit, total) };
  }

  static async updateStatus(id: string, status: string) {
    await connectDB();
    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) throw new Error('Review not found');

    if (status === 'approved') {
      const reviews = await Review.find({
        companyId: review.companyId,
        status: 'approved',
      });
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Company.findByIdAndUpdate(review.companyId, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      });
    }

    return review;
  }

  static async delete(id: string) {
    await connectDB();
    await Review.findByIdAndDelete(id);
    return { message: 'Review deleted' };
  }
}
