'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { nguoiDungHienTai } from '@/lib/auth/nguoi-dung-tu-phien';
import { luuLoHangLoat, sinhLo10Bai, type ItemHangLoat } from '@/lib/studio/hang-loat';
import type { BeMat } from '@/lib/studio/kieu';

export async function sinhHangLoatAction(soLuong: number = 10, beMat: BeMat = 'fanpage') {
  const workspaceId = await workspaceHienTai();
  const nguoi = await nguoiDungHienTai();

  const ketQua = await sinhLo10Bai({
    workspaceId,
    beMat,
    soLuong,
    userId: nguoi.userId,
  });

  return ketQua;
}

export async function luuLoAction(danhSach: ItemHangLoat[], trangThai: 'ban_nhap' | 'san_sang' = 'san_sang') {
  const workspaceId = await workspaceHienTai();
  return luuLoHangLoat(workspaceId, danhSach, trangThai);
}
