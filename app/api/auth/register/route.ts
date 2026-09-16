import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate
    if (!email || !password) {
      return Response.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Check existing user
    const existing = getUserByEmail(email);
    if (existing) {
      return Response.json(
        { error: 'Email đã được sử dụng' },
        { status: 409 }
      );
    }

    // Hash password & create user
    const password_hash = await bcrypt.hash(password, 12);
    const user = createUser({
      email,
      name: name || email.split('@')[0],
      password_hash,
    });

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return Response.json(
      { error: 'Đã xảy ra lỗi. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
