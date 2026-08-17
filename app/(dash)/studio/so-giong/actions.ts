'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { soGiongBonBeMat, type ThamSoSoGiong } from '@/lib/studio/so-giong';

export async function soGiongAction(thamSo: Omit<ThamSoSoGiong, 'workspaceId'>) {
  const workspaceId = await workspaceHienTai();
  return soGiongBonBeMat({
    ...thamSo,
    workspaceId,
  });
}
