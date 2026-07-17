import { NextRequest } from 'next/server';
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

    return apiSuccess(settings);
  } catch (error) {
    return apiError('Failed to update settings', 500);
  }
}
