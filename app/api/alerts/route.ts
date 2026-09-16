import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getAlertsByUserId, createAlert, toggleAlert, deleteAlert } from '@/lib/db';

// GET — List alerts for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const alerts = getAlertsByUserId(session.user.id);

  return Response.json({
    success: true,
    data: alerts,
    count: alerts.length,
  });
}

// POST — Create new alert
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { origin, destination, target_price, currency, depart_date_from, depart_date_to } = body;

    if (!origin || !destination || !target_price) {
      return Response.json(
        { error: 'Thiếu thông tin: origin, destination, target_price' },
        { status: 400 }
      );
    }

    if (target_price <= 0) {
      return Response.json(
        { error: 'Giá mục tiêu phải lớn hơn 0' },
        { status: 400 }
      );
    }

    const alert = createAlert({
      user_id: session.user.id,
      origin,
      destination,
      target_price,
      currency,
      depart_date_from,
      depart_date_to,
    });

    return Response.json({ success: true, data: alert });
  } catch (error) {
    console.error('Create alert error:', error);
    return Response.json({ error: 'Không thể tạo thông báo' }, { status: 500 });
  }
}

// PUT — Toggle alert on/off
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return Response.json({ error: 'Thiếu alert ID' }, { status: 400 });
    }

    const success = toggleAlert(id, session.user.id);
    if (!success) {
      return Response.json({ error: 'Không tìm thấy thông báo' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Toggle alert error:', error);
    return Response.json({ error: 'Không thể cập nhật' }, { status: 500 });
  }
}

// DELETE — Delete alert
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'Thiếu alert ID' }, { status: 400 });
    }

    const success = deleteAlert(id, session.user.id);
    if (!success) {
      return Response.json({ error: 'Không tìm thấy thông báo' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete alert error:', error);
    return Response.json({ error: 'Không thể xóa' }, { status: 500 });
  }
}
