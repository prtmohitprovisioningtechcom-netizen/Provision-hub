// @ts-nocheck
import crypto from 'crypto';
import pool from '@/lib/db';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { RowDataPacket } from 'mysql2';

export class GalleryService {
  static async getByCompany(companyId: string) {
    const [galleries] = await pool.execute<RowDataPacket[]>('SELECT * FROM galleries WHERE companyId = ?', [companyId]);
    if (galleries.length === 0) {
      const id = crypto.randomUUID();
      await pool.execute('INSERT INTO galleries (id, companyId, images) VALUES (?, ?, ?)', [id, companyId, JSON.stringify([])]);
      return { _id: id, id, companyId, images: [] };
    }
    const g = galleries[0];
    return {
      ...g,
      _id: g.id,
      images: typeof g.images === 'string' ? JSON.parse(g.images) : (g.images || [])
    };
  }

  static async addImage(companyId: string, imageData: string, caption?: string) {
    const { url, publicId } = await uploadToCloudinary(imageData, `gallery/${companyId}`);
    
    let gallery = await this.getByCompany(companyId);
    gallery.images.push({
      url,
      publicId,
      caption,
      order: gallery.images.length,
    });

    await pool.execute('UPDATE galleries SET images = ? WHERE id = ?', [JSON.stringify(gallery.images), gallery.id]);
    return gallery;
  }

  static async removeImage(companyId: string, imageIndex: number) {
    const gallery = await this.getByCompany(companyId);
    
    const image = gallery.images[imageIndex];
    if (image?.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    gallery.images.splice(imageIndex, 1);
    await pool.execute('UPDATE galleries SET images = ? WHERE id = ?', [JSON.stringify(gallery.images), gallery.id]);
    return gallery;
  }

  static async reorderImages(companyId: string, imageIds: number[]) {
    const gallery = await this.getByCompany(companyId);
    
    const reordered = imageIds.map((idx, order) => ({
      ...gallery.images[idx],
      order,
    }));
    
    gallery.images = reordered;
    await pool.execute('UPDATE galleries SET images = ? WHERE id = ?', [JSON.stringify(gallery.images), gallery.id]);
    return gallery;
  }
}
