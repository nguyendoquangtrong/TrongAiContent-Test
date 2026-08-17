'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { luuChuoiBai, sinhChuoiBai, type ThamSoSinhChuoiBai } from '@/lib/studio/chuoi-bai';
import type { BaiVietBienSoan } from '@/lib/studio/kieu';

export async function sinhChuoiBaiAction(thamSo: Omit<ThamSoSinhChuoiBai, 'workspaceId'>) {
  const workspaceId = await workspaceHienTai();
  return sinhChuoiBai({
    ...thamSo,
    workspaceId,
  });
}

export async function luuChuoiBaiAction(
  chuoiId: string,
  danhSachBai: (BaiVietBienSoan & { thuTu: number })[],
) {
  const workspaceId = await workspaceHienTai();
  return luuChuoiBai(workspaceId, chuoiId, danhSachBai);
}
