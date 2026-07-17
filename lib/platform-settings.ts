import 'server-only';

import { cache } from 'react';
import { connectDB } from '@/lib/mongodb';
import PlatformSettings from '@/models/PlatformSettings';

/**
 * Deduplicates settings reads during a server render. A fresh model instance
 * supplies schema defaults without writing to MongoDB on public page requests.
 */
export const getPlatformSettings = cache(async () => {
  try {
    await connectDB();

    const settings =
      (await PlatformSettings.findOne().lean()) ?? new PlatformSettings().toObject();

    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    // Keep public pages deployable when build-time database access is unavailable.
    console.warn(
      'Using default platform settings because MongoDB is unavailable:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return JSON.parse(JSON.stringify(new PlatformSettings().toObject()));
  }
});
