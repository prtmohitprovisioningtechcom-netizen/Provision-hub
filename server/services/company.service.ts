// @ts-nocheck
import pool from '@/lib/db';
import { getPaginationMeta } from '@/lib/utils';
import { SearchFilters, CompanyStatus } from '@/types';
import { LANDING_SECTIONS } from '@/constants';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

function buildSearchQuery(filters: SearchFilters) {
  let queryStr = 'SELECT * FROM companies WHERE status = "approved"';
  const params: unknown[] = [];

  if (filters.query) {
    queryStr += ' AND (name LIKE ? OR description LIKE ?)';
    const term = `%${filters.query}%`;
    params.push(term, term);
  }
  if (filters.category) {
    queryStr += ' AND category = ?';
    params.push(filters.category);
  }
  if (filters.city) {
    queryStr += ' AND JSON_UNQUOTE(JSON_EXTRACT(address, "$.city")) LIKE ?';
    params.push(`%${filters.city}%`);
  }
  if (filters.state) {
    queryStr += ' AND JSON_UNQUOTE(JSON_EXTRACT(address, "$.state")) LIKE ?';
    params.push(`%${filters.state}%`);
  }
  if (filters.country) {
    queryStr += ' AND JSON_UNQUOTE(JSON_EXTRACT(address, "$.country")) LIKE ?';
    params.push(`%${filters.country}%`);
  }
  if (filters.verified) {
    queryStr += ' AND isVerified = 1';
  }

  return { queryStr, params };
}

export class CompanyService {
  static async search(filters: SearchFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 12));
    const skip = (page - 1) * limit;

    const { queryStr, params } = buildSearchQuery(filters);

    let orderBy = 'ORDER BY createdAt DESC';
    if (filters.topRated) orderBy = 'ORDER BY rating DESC';
    if (filters.newest) orderBy = 'ORDER BY createdAt DESC';
    if (filters.sortBy && ['createdAt', 'rating', 'name'].includes(filters.sortBy)) {
      orderBy = `ORDER BY ${filters.sortBy} ${filters.sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
    }

    const [[countResult], [companies]] = await Promise.all([
      pool.execute<RowDataPacket[]>(`SELECT COUNT(*) as count FROM (${queryStr}) as t`, params),
      pool.execute<RowDataPacket[]>(
        `${queryStr} ${orderBy} LIMIT ? OFFSET ?`,
        [...params, limit, skip]
      ),
    ]);

    const total = countResult[0].count;

    return {
      companies: companies.map(c => ({
        _id: c.id,
        name: c.name,
        slug: c.slug,
        logo: c.logo,
        banner: c.banner,
        category: c.category,
        address: typeof c.address === 'string' ? JSON.parse(c.address) : c.address,
        rating: Number(c.rating) || 0,
        reviewCount: Number(c.reviewCount) || 0,
        isVerified: Boolean(c.isVerified),
        description: c.description
      })),
      pagination: getPaginationMeta(page, limit, total),
    };
  }

  static async getBySlug(slug: string) {
    const [companies] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM companies WHERE slug = ? AND status = "approved"',
      [slug]
    );
    if (companies.length === 0) throw new Error('Company not found');
    const companyRaw = companies[0];
    const companyId = companyRaw.id;
    const company = {
      ...companyRaw,
      _id: companyRaw.id,
      address: typeof companyRaw.address === 'string' ? JSON.parse(companyRaw.address) : companyRaw.address,
      socialLinks: typeof companyRaw.socialLinks === 'string' ? JSON.parse(companyRaw.socialLinks) : companyRaw.socialLinks,
      businessHours: typeof companyRaw.businessHours === 'string' ? JSON.parse(companyRaw.businessHours) : companyRaw.businessHours,
      theme: typeof companyRaw.theme === 'string' ? JSON.parse(companyRaw.theme) : companyRaw.theme,
      seo: typeof companyRaw.seo === 'string' ? JSON.parse(companyRaw.seo) : companyRaw.seo,
      rating: Number(companyRaw.rating) || 0,
      reviewCount: Number(companyRaw.reviewCount) || 0,
      isVerified: Boolean(companyRaw.isVerified),
    };

    const [[products], [services], [reviews], [landingPages], [galleries], [blogs]] = await Promise.all([
      pool.execute<RowDataPacket[]>('SELECT * FROM products WHERE companyId = ? AND status = "active" LIMIT 12', [companyId]),
      pool.execute<RowDataPacket[]>('SELECT * FROM services WHERE companyId = ? LIMIT 12', [companyId]),
      pool.execute<RowDataPacket[]>('SELECT * FROM reviews WHERE companyId = ? AND status = "approved" ORDER BY createdAt DESC LIMIT 10', [companyId]),
      pool.execute<RowDataPacket[]>('SELECT * FROM landing_pages WHERE companyId = ?', [companyId]),
      pool.execute<RowDataPacket[]>('SELECT * FROM galleries WHERE companyId = ?', [companyId]),
      pool.execute<RowDataPacket[]>('SELECT title, slug, content, excerpt, category, featuredImage, status, createdAt, updatedAt, companyId FROM blogs WHERE companyId = ? AND status = "published" ORDER BY createdAt DESC LIMIT 6', [companyId]),
    ]);

    const landingPageRaw = landingPages[0];
    let landingPage = null;
    if (landingPageRaw) {
      landingPage = {
        ...landingPageRaw,
        sections: typeof landingPageRaw.sections === 'string' ? JSON.parse(landingPageRaw.sections) : (landingPageRaw.sections || []),
        pages: typeof landingPageRaw.pages === 'string' ? JSON.parse(landingPageRaw.pages) : (landingPageRaw.pages || []),
        isPublished: Boolean(landingPageRaw.isPublished)
      };
    }

    const galleryRaw = galleries[0];
    let gallery = null;
    if (galleryRaw) {
      gallery = {
        ...galleryRaw,
        images: typeof galleryRaw.images === 'string' ? JSON.parse(galleryRaw.images) : (galleryRaw.images || []),
      };
    }

    const allowedTypes = new Set<string>(LANDING_SECTIONS.map((section) => section.type));
    const seenTypes = new Set<string>();
    const savedSections = (landingPage?.sections || []).filter((section: any) => {
      if (!allowedTypes.has(section.type) || seenTypes.has(section.type)) return false;
      seenTypes.add(section.type);
      return true;
    });
    const savedTypes = new Set(savedSections.map((section: any) => section.type));
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
    ].sort((a, b) => a.order - b.order).map((section, order) => ({ ...section, order }));

    const completeLandingPage = landingPage
      ? {
          ...landingPage,
          sections: sections.map((section: any) => {
            if (section.type !== 'gallery') return section;
            const fromLanding =
              (section.items && section.items.length > 0
                ? section.items
                : (section.images || []).map((image: string, index: number) => ({
                    image,
                    title: `Gallery ${index + 1}`,
                    description: '',
                  }))) || [];
            if (fromLanding.length > 0) {
              return { ...section, items: fromLanding };
            }
            const fromGallery =
              gallery?.images?.map(
                (image: { url?: string; caption?: string }, index: number) => ({
                  image: image.url || '',
                  title: image.caption || `Gallery ${index + 1}`,
                  description: image.caption || '',
                }),
              ) || [];
            return fromGallery.length
              ? { ...section, items: fromGallery, isVisible: section.isVisible !== false }
              : section;
          }),
        }
      : { sections, isPublished: true };

    return {
      company,
      products: products.map(p => ({ ...p, _id: p.id })),
      services: services.map(s => ({ ...s, _id: s.id })),
      reviews: reviews.map(r => ({ ...r, _id: r.id })),
      landingPage: completeLandingPage,
      gallery,
      blogs: blogs.map(b => ({ ...b, _id: b.id })),
    };
  }

  static async getById(id: string) {
    const [companies] = await pool.execute<RowDataPacket[]>('SELECT * FROM companies WHERE id = ?', [id]);
    if (companies.length === 0) throw new Error('Company not found');
    const company = companies[0];
    return {
      ...company,
      _id: company.id,
      address: typeof company.address === 'string' ? JSON.parse(company.address) : company.address,
      socialLinks: typeof company.socialLinks === 'string' ? JSON.parse(company.socialLinks) : company.socialLinks,
      businessHours: typeof company.businessHours === 'string' ? JSON.parse(company.businessHours) : company.businessHours,
      theme: typeof company.theme === 'string' ? JSON.parse(company.theme) : company.theme,
      seo: typeof company.seo === 'string' ? JSON.parse(company.seo) : company.seo,
      isVerified: Boolean(company.isVerified),
    };
  }

  static async update(id: string, data: Partial<Record<string, unknown>>) {
    if (Object.keys(data).length === 0) return await this.getById(id);

    const keys = Object.keys(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => {
      const val = data[k];
      return typeof val === 'object' && val !== null ? JSON.stringify(val) : val;
    });
    params.push(id);

    await pool.execute(`UPDATE companies SET ${setClause} WHERE id = ?`, params);
    return await this.getById(id);
  }

  static async getDashboardStats(companyId: string) {
    const [[productsResult], [servicesResult], [leadsResult], [reviewsResult], [newLeadsResult], [recentLeads]] = await Promise.all([
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM products WHERE companyId = ?', [companyId]),
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM services WHERE companyId = ?', [companyId]),
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM leads WHERE companyId = ?', [companyId]),
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM reviews WHERE companyId = ?', [companyId]),
      pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM leads WHERE companyId = ? AND status = "new"', [companyId]),
      pool.execute<RowDataPacket[]>('SELECT id as _id, customerName, email, message, status, createdAt FROM leads WHERE companyId = ? ORDER BY createdAt DESC LIMIT 5', [companyId]),
    ]);

    return {
      stats: {
        products: productsResult[0].count,
        services: servicesResult[0].count,
        leads: leadsResult[0].count,
        reviews: reviewsResult[0].count,
        newLeads: newLeadsResult[0].count
      },
      recentLeads: recentLeads.map(l => ({ ...l, _id: l._id })),
    };
  }

  static async getAllForAdmin(page = 1, limit = 20, status?: CompanyStatus) {
    const skip = (page - 1) * limit;
    
    let queryStr = 'SELECT id as _id, name, slug, logo, category, address, status, isVerified, subscription, createdAt, ownerName, email FROM companies';
    let countQueryStr = 'SELECT COUNT(*) as count FROM companies';
    const params: unknown[] = [];

    if (status) {
      queryStr += ' WHERE status = ?';
      countQueryStr += ' WHERE status = ?';
      params.push(status);
    }

    queryStr += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';

    const [[countResult], [companies]] = await Promise.all([
      pool.execute<RowDataPacket[]>(countQueryStr, params),
      pool.execute<RowDataPacket[]>(queryStr, [...params, limit, skip])
    ]);

    return {
      companies: companies.map(c => ({
        ...c,
        address: typeof c.address === 'string' ? JSON.parse(c.address) : c.address,
        isVerified: Boolean(c.isVerified)
      })),
      pagination: getPaginationMeta(page, limit, countResult[0].count)
    };
  }

  static async updateStatus(id: string, status: CompanyStatus) {
    const isVerified = status === 'approved' ? 1 : 0;
    await pool.execute(
      'UPDATE companies SET status = ?, isVerified = ? WHERE id = ?',
      [status, isVerified, id]
    );
    return await this.getById(id);
  }

  static async delete(id: string) {
    await pool.execute('DELETE FROM companies WHERE id = ?', [id]);
    // Related items will be automatically deleted by ON DELETE CASCADE foreign key constraints in schema.sql
    return { message: 'Company deleted' };
  }
}