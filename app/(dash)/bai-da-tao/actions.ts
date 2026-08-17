'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';

export async function doiTrangThaiAction(id: string, trangThai: 'san_sang' | 'ban_nhap' | 'da_dang') {
  const workspaceId = await workspaceHienTai();
  const repo = createRepo(workspaceId);

  const dong = await repo.contents.sua(id, {
    trangThai,
    ...(trangThai === 'da_dang' ? { ngayDang: new Date() } : {}),
  });

  return { thanhCong: Boolean(dong) };
}

export async function xoaBaiAction(id: string) {
  const workspaceId = await workspaceHienTai();
  const repo = createRepo(workspaceId);

  await repo.contents.xoa(id);
  return { thanhCong: true };
}
