import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { authenticateRequest } from '@/server/middleware/auth';
import { apiSuccess, apiError } from '@/server/utils/api-response';
import { connectDB } from '@/lib/mongodb';
import PlatformSettings from '@/models/PlatformSettings';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Default settings if not found
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    return apiSuccess(settings);
  } catch (error) {
    console.error('Failed to fetch platform settings:', error);
    return apiError('Failed to fetch settings', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user || user.role !== 'super_admin') {
      return apiError('Unauthorized', 403);
    }

    await connectDB();
    const data = await request.json();
    
    // We only have one global settings document
    let settings = await PlatformSettings.findOne();
    
    if (!settings) {
      settings = await PlatformSettings.create({ ...data, updatedBy: user.userId });
    } else {
      settings = await PlatformSettings.findOneAndUpdate(
        { _id: settings._id },
        { ...data, updatedBy: user.userId },
        { new: true }
      );
    }

    revalidatePath('/', 'layout');
    revalidatePath('/search');
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/admin', 'layout');

    return apiSuccess(settings);
  } catch (error) {
    console.error('Failed to update platform settings:', error);
    return apiError('Failed to update settings', 500);
  }
}
