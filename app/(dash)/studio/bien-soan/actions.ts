'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { luuBaiViet, sinhNoiDungBaiViet, type ThamSoSinhBaiViet } from '@/lib/studio/bien-soan';
import { sinhKichBan } from '@/lib/studio/kich-ban';
import { sinhVisualConcept } from '@/lib/studio/sinh-anh';
import type { BaiVietBienSoan, BeMat } from '@/lib/studio/kieu';

export async function sinhBaiVietAction(thamSo: Omit<ThamSoSinhBaiViet, 'workspaceId'>) {
  const workspaceId = await workspaceHienTai();
  return sinhNoiDungBaiViet({
    ...thamSo,
    workspaceId,
  });
}

export async function luuBaiVietAction(
  baiViet: BaiVietBienSoan,
  trangThai: 'ban_nhap' | 'san_sang' | 'da_dang' = 'ban_nhap',
) {
  const workspaceId = await workspaceHienTai();
  return luuBaiViet(workspaceId, baiViet, trangThai);
}

export async function sinhKichBanTuBaiAction(
  tieuDe: string,
  noiDung: string,
  sanPhamId?: string | null,
  beMat?: BeMat,
) {
  const workspaceId = await workspaceHienTai();
  return sinhKichBan({
    workspaceId,
    beMat: beMat ?? 'tiktok',
    yTuong: { tieuDe },
    noiDungBaiViet: noiDung,
    sanPhamId,
  });
}

export async function sinhVisualAction(
  tieuDe: string,
  noiDung: string,
  sanPhamId?: string | null,
  dinhDang?: 'Feed' | 'Story' | 'Reels',
) {
  const workspaceId = await workspaceHienTai();
  return sinhVisualConcept({
    workspaceId,
    tieuDe,
    noiDung,
    sanPhamId,
    dinhDang,
  });
}
