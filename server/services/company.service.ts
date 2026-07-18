import Company from '@/models/Company';
import Product from '@/models/Product';
import Service from '@/models/Service';
import Review from '@/models/Review';
import Lead from '@/models/Lead';
import LandingPage from '@/models/LandingPage';
import Gallery from '@/models/Gallery';
import Blog from '@/models/Blog';
import { connectDB } from '@/lib/mongodb';
import { getPaginationMeta } from '@/lib/utils';
import { SearchFilters, CompanyStatus } from '@/types';
import { LANDING_SECTIONS } from '@/constants';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 80);
}

export class CompanyService {
  static async search(filters: SearchFilters) {
    await connectDB();

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 12));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { status: 'approved' };

    if (filters.query) {
      const searchTerm = escapeRegex(filters.query.trim());
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }
    if (filters.category) query.category = filters.category;
    if (filters.city) {
      query['address.city'] = { $regex: escapeRegex(filters.city), $options: 'i' };
    }
    if (filters.state) {
      query['address.state'] = { $regex: escapeRegex(filters.state), $options: 'i' };
    }
    if (filters.country) {
      query['address.country'] = { $regex: escapeRegex(filters.country), $options: 'i' };
    }
    if (filters.verified) query.isVerified = true;

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (filters.topRated) sort = { rating: -1 };
    if (filters.newest) sort = { createdAt: -1 };
    if (filters.sortBy && ['createdAt', 'rating', 'name'].includes(filters.sortBy)) {
      sort = { [filters.sortBy]: filters.sortOrder === 'asc' ? 1 : -1 };
    }

    const [companies, total] = await Promise.all([
      Company.find(query)
        .select('name slug logo banner category address rating reviewCount isVerified description')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(query),
    ]);

    return {
      companies,
      pagination: getPaginationMeta(page, limit, total),
    };
  }

  static async getBySlug(slug: string) {
    await connectDB();

    const company = await Company.findOne({ slug, status: 'approved' }).lean();
    if (!company) throw new Error('Company not found');

    const [products, services, reviews, landingPage, gallery, blogs] = await Promise.all([
      Product.find({ companyId: company._id, status: 'active' }).limit(12).lean(),
      Service.find({ companyId: company._id }).limit(12).lean(),
      Review.find({ companyId: company._id, status: 'approved' })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      LandingPage.findOne({ companyId: company._id }).lean(),
      Gallery.findOne({ companyId: company._id }).lean(),
      Blog.find({ companyId: company._id, status: 'published' })
        .select('title slug content excerpt category featuredImage status createdAt updatedAt companyId')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const allowedTypes = new Set<string>(
      LANDING_SECTIONS.map((section) => section.type),
    );
    const seenTypes = new Set<string>();
    const savedSections = (landingPage?.sections || []).filter((section) => {
      if (!allowedTypes.has(section.type) || seenTypes.has(section.type)) return false;
      seenTypes.add(section.type);
      return true;
    });
    const savedTypes = new Set(savedSections.map((section) => section.type));
    const sections = [
      ...savedSections,
      ...LANDING_SECTIONS.filter((section) => !savedTypes.has(section.type)).map(
        (section, index) => ({
          ...section,
          id: `section-${section.type}-${index}`,
          content: '',
          isVisible: true,
          items: 'items' in section ? section.items : [],
          images: [],
        }),
      ),
    ]
      .sort((a, b) => a.order - b.order)
      .map((section, order) => ({ ...section, order }));

    const completeLandingPage = landingPage
      ? { ...landingPage, sections }
      : { sections, isPublished: true };

    return {
      company,
      products,
      services,
      reviews,
      landingPage: completeLandingPage,
      gallery,
      blogs,
    };
  }

  static async getById(id: string) {
    await connectDB();
    const company = await Company.findById(id).lean();
    if (!company) throw new Error('Company not found');
    return company;
  }

  static async update(id: string, data: Partial<Record<string, unknown>>) {
    await connectDB();
    const company = await Company.findByIdAndUpdate(id, data, { new: true });
    if (!company) throw new Error('Company not found');
    return company;
  }

  static async getDashboardStats(companyId: string) {
    await connectDB();

    const [products, services, leads, reviews, newLeads] = await Promise.all([
      Product.countDocuments({ companyId }),
      Service.countDocuments({ companyId }),
      Lead.countDocuments({ companyId }),
      Review.countDocuments({ companyId }),
      Lead.countDocuments({ companyId, status: 'new' }),
    ]);

    const recentLeads = await Lead.find({ companyId })
      .select('customerName email message status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      stats: { products, services, leads, reviews, newLeads },
      recentLeads,
    };
  }

  static async getAllForAdmin(page = 1, limit = 20, status?: CompanyStatus) {
    await connectDB();
    const skip = (page - 1) * limit;
    const query: { status?: CompanyStatus } = status ? { status } : {};

    const [companies, total] = await Promise.all([
      Company.find(query)
        .select(
          'name slug logo category address status isVerified subscription createdAt ownerName email',
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(query),
    ]);

    return { companies, pagination: getPaginationMeta(page, limit, total) };
  }

  static async updateStatus(id: string, status: CompanyStatus) {
    await connectDB();
    const company = await Company.findByIdAndUpdate(
      id,
      { status, isVerified: status === 'approved' },
      { new: true },
    );
    if (!company) throw new Error('Company not found');
    return company;
  }

  static async delete(id: string) {
    await connectDB();
    await Company.findByIdAndDelete(id);
    await Promise.all([
      Product.deleteMany({ companyId: id }),
      Service.deleteMany({ companyId: id }),
      Lead.deleteMany({ companyId: id }),
      Review.deleteMany({ companyId: id }),
      LandingPage.deleteMany({ companyId: id }),
      Gallery.deleteMany({ companyId: id }),
    ]);
    return { message: 'Company deleted' };
  }
}
