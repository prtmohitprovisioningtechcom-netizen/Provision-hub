import LandingPage from '@/models/LandingPage';
import { connectDB } from '@/lib/mongodb';

export class LandingPageService {
  static async getByCompany(companyId: string) {
    await connectDB();
    const page = await LandingPage.findOne({ companyId }).lean();
    if (!page) throw new Error('Landing page not found');
    return page;
  }

  static async update(companyId: string, sections: Array<Record<string, unknown>>) {
    await connectDB();
    const page = await LandingPage.findOneAndUpdate(
      { companyId },
      { sections },
      { new: true, upsert: true },
    );
    return page;
  }

  static async updateSection(
    companyId: string,
    sectionId: string,
    data: Record<string, unknown>,
  ) {
    await connectDB();
    const page = await LandingPage.findOne({ companyId });
    if (!page) throw new Error('Landing page not found');

    const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) throw new Error('Section not found');

    page.sections[sectionIndex] = { ...page.sections[sectionIndex], ...data };
    await page.save();
    return page;
  }
}
