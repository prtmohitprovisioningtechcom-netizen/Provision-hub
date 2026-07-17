import { NextRequest } from 'next/server';
import { AuthService } from '@/server/services/auth.service';
import { loginSchema, registerSchema, companyRegisterSchema, forgotPasswordSchema, resetPasswordSchema, adminRegisterSchema } from '@/lib/validators';
import { apiSuccess, apiError, parseBody } from '@/server/utils/api-response';
import { COOKIE_OPTIONS, AUTH_COOKIE } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`auth-register-${ip}`, 10, 60000);
    if (!limit.success) return apiError('Too many requests', 429);

    const body = await parseBody(request);
    const action = (body as { action?: string }).action;

    if (action === 'register-company') {
      const data = companyRegisterSchema.parse(body);
      const result = await AuthService.registerCompany(data);
      const response = apiSuccess(result, 'Company registered successfully', 201);
      response.cookies.set(AUTH_COOKIE, result.token, COOKIE_OPTIONS);
      return response;
    }

    if (action === 'login-admin') {
      const data = loginSchema.parse(body);
      const result = await AuthService.loginAdmin(data);
      const response = apiSuccess(result, 'Admin login successful');
      response.cookies.set(AUTH_COOKIE, result.token, COOKIE_OPTIONS);
      return response;
    }

    if (action === 'register-admin') {
      const data = adminRegisterSchema.parse(body);
      const result = await AuthService.registerAdmin(data);
      const response = apiSuccess(result, 'Admin registered successfully', 201);
      response.cookies.set(AUTH_COOKIE, result.token, COOKIE_OPTIONS);
      return response;
    }

    if (action === 'login') {
      const data = loginSchema.parse(body);
      const result = await AuthService.login(data);
      const response = apiSuccess(result, 'Login successful');
      response.cookies.set(AUTH_COOKIE, result.token, COOKIE_OPTIONS);
      return response;
    }

    if (action === 'register') {
      const data = registerSchema.parse(body);
      const result = await AuthService.register(data);
      const response = apiSuccess(result, 'Registration successful', 201);
      response.cookies.set(AUTH_COOKIE, result.token, COOKIE_OPTIONS);
      return response;
    }

    if (action === 'forgot-password') {
      const data = forgotPasswordSchema.parse(body);
      const result = await AuthService.forgotPassword(data.email);
      return apiSuccess(result);
    }

    if (action === 'reset-password') {
      const data = resetPasswordSchema.parse(body);
      const result = await AuthService.resetPassword(data.token, data.password);
      return apiSuccess(result);
    }

    if (action === 'verify-email') {
      const token = (body as { token?: string }).token;
      if (!token) return apiError('Token required');
      const result = await AuthService.verifyEmail(token);
      return apiSuccess(result);
    }

    return apiError('Invalid action');
  } catch (error) {
    console.error('Authentication API error:', error);
    const message = error instanceof Error ? error.message : 'Authentication failed';
    const isDatabaseError =
      error instanceof Error &&
      (error.name.includes('Mongo') ||
        error.name.includes('Mongoose') ||
        error.message.includes('MONGODB_URI'));

    return apiError(
      isDatabaseError ? 'Database is temporarily unavailable' : message,
      isDatabaseError ? 503 : 400,
    );
  }
}

export async function DELETE() {
  const response = apiSuccess({ message: 'Logged out' });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
