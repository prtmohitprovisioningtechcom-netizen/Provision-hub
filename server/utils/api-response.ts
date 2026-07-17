import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export function apiSuccess<T>(data: T, message = 'Success', status = 200) {
  const response: ApiResponse<T> = { success: true, message, data };
  return NextResponse.json(response, { status });
}

export function apiError(message: string, status = 400, error?: string) {
  const response: ApiResponse = { success: false, message, error };
  return NextResponse.json(response, { status });
}

export function apiPaginated<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number },
  message = 'Success',
) {
  const response: ApiResponse<T[]> = { success: true, message, data, pagination };
  return NextResponse.json(response);
}

export async function parseBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}
