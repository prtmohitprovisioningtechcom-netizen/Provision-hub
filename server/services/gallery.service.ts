import Gallery from '@/models/Gallery';
import { connectDB } from '@/lib/mongodb';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export class GalleryService {
  static async getByCompany(companyId: string) {
    await connectDB();
    let gallery = await Gallery.findOne({ companyId });
    if (!gallery) {
      gallery = await Gallery.create({ companyId, images: [] });
    }
    return gallery;
  }

  static async addImage(companyId: string, imageData: string, caption?: string) {
    await connectDB();
    const { url, publicId } = await uploadToCloudinary(imageData, `gallery/${companyId}`);

    let gallery = await Gallery.findOne({ companyId });
    if (!gallery) {
      gallery = await Gallery.create({ companyId, images: [] });
    }

    gallery.images.push({
      url,
      publicId,
      caption,
      order: gallery.images.length,
    });
    await gallery.save();
    return gallery;
  }

  static async removeImage(companyId: string, imageIndex: number) {
    await connectDB();
    const gallery = await Gallery.findOne({ companyId });
    if (!gallery) throw new Error('Gallery not found');

    const image = gallery.images[imageIndex];
    if (image?.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    gallery.images.splice(imageIndex, 1);
    await gallery.save();
    return gallery;
  }

  static async reorderImages(companyId: string, imageIds: number[]) {
    await connectDB();
    const gallery = await Gallery.findOne({ companyId });
    if (!gallery) throw new Error('Gallery not found');

    const reordered = imageIds.map((idx, order) => ({
      ...gallery.images[idx],
      order,
    }));
    gallery.images = reordered;
    await gallery.save();
    return gallery;
  }
}
