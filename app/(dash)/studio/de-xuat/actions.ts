'use server';

import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { nguoiDungHienTai } from '@/lib/auth/nguoi-dung-tu-phien';
import { createRepo } from '@/lib/data-access';
import { deXuatYTuong } from '@/lib/studio/de-xuat';
import type { BeMat, YTuongDeXuat } from '@/lib/studio/kieu';

export async function sinhDeXuatAction(beMat: BeMat, soLuong: number) {
  const workspaceId = await workspaceHienTai();
  const nguoi = await nguoiDungHienTai();

  const ketQua = await deXuatYTuong({
    workspaceId,
    beMat,
    soLuong,
    userId: nguoi.userId,
  });

  return ketQua;
}

export async function luuYTuongAction(yTuong: YTuongDeXuat) {
  const workspaceId = await workspaceHienTai();
  const repo = createRepo(workspaceId);

  // Tim pillarId va personaId neu khop ten
  const [truCotList, chanDungList] = await Promise.all([
    repo.truCot.list(),
    repo.chanDung.list(),
  ]);

  const truCot = yTuong.truCot
    ? truCotList.find((t: { ten: string }) => t.ten.toLowerCase() === yTuong.truCot?.toLowerCase())
    : null;

  const chanDung = yTuong.chanDung
    ? chanDungList.find((c: { ten: string }) => c.ten.toLowerCase() === yTuong.chanDung?.toLowerCase())
    : null;

  const dong = await repo.yTuong.tao({
    beMat: yTuong.beMat,
    gocTiepCan: yTuong.gocTiepCan ?? null,
    cauMoDau: yTuong.cauMoDau ?? null,
    lyDoDeXuat: yTuong.lyDoDeXuat ?? null,
    pillarId: truCot?.id ?? null,
    personaId: chanDung?.id ?? null,
    trendSignalId: yTuong.trendSignalId ?? null,
    nguonYTuong: yTuong.trendSignalId ? 'xu-huong' : 'may-de-xuat',
    daDung: false,
  });

  return { thanhCong: true, id: dong.id };
}

export async function xoaYTuongAction(ideaId: string) {
  const workspaceId = await workspaceHienTai();
  const repo = createRepo(workspaceId);
  await repo.yTuong.xoa(ideaId);
  return { thanhCong: true };
}
