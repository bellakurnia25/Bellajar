import { NextResponse } from 'next/server';

export const ok = (data = {}, status = 200) => NextResponse.json({ ok: true, ...data }, { status });
export const fail = (error, status = 400) => NextResponse.json({ ok: false, error }, { status });

export function toId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
