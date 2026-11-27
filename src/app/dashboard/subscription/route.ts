import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
    const destination = request.nextUrl.clone();
    destination.pathname = '/dashboard/settings';
    destination.hash = 'subscription';
    return NextResponse.redirect(destination);
}
