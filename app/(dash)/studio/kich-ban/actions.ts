'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { sinhKichBan, type ThamSoSinhKichBan } from '@/lib/studio/kich-ban';

export async function sinhKichBanAction(thamSo: Omit<ThamSoSinhKichBan, 'workspaceId'>) {
  const workspaceId = await workspaceHienTai();
  return sinhKichBan({
    ...thamSo,
    workspaceId,
  });
}
