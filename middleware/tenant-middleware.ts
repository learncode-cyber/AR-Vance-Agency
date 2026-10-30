import { NextRequest, NextResponse } from 'next/server';

export async function tenantMiddleware(req: NextRequest) {
  try {
    const tenantFromHeader = req.headers.get('x-tenant-id');
    const tenantId = tenantFromHeader || 'default-tenant';

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-tenant-id', tenantId);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
