/**
 * Sinh chuoi bai noi tiep khong lap y (Studio - Chuoi bai).
 *
 * Su dung tham so `mach` de truyen noi dung cac bai truoc cho mo hinh noi mach.
 * Gan `chuoiId` va `thuTuTrongChuoi` de quan ly quan he trong CSDL.
 */

import crypto from 'node:crypto';
import { createRepo } from '@/lib/data-access';
import { sinhNoiDungBaiViet } from './bien-soan';
import type { BaiVietBienSoan, BeMat, KetQuaStudio } from './kieu';

export type ThamSoSinhChuoiBai = {
  workspaceId: string;
  beMat?: BeMat;
  chuDeChinh: string;
  soLuongBai?: number; // thuong tu 3 den 5 bai
  truCot?: string | null;
  chanDung?: string | null;
};

export type KetQuaChuoiBai = {
  chuoiId: string;
  chuDeChinh: string;
  danhSachBai: (BaiVietBienSoan & { thuTu: number })[];
};

/**
 * Sinh chuoi bai lien ket theo mach.
 */
export async function sinhChuoiBai(
  thamSo: ThamSoSinhChuoiBai,
): Promise<KetQuaStudio<KetQuaChuoiBai>> {
  const {
    workspaceId,
    beMat = 'fanpage',
    chuDeChinh,
    soLuongBai = 3,
    truCot,
    chanDung,
  } = thamSo;

  const chuoiId = crypto.randomUUID();
  const danhSachBai: (BaiVietBienSoan & { thuTu: number })[] = [];
  const machCacBaiTruoc: string[] = [];

  for (let thuTu = 1; thuTu <= soLuongBai; thuTu += 1) {
    const gocTiepCan =
      thuTu === 1
        ? `Phần ${thuTu}: Nêu vấn đề và thực trạng của ${chuDeChinh}`
        : thuTu === soLuongBai
          ? `Phần ${thuTu}: Tổng kết, hướng giải quyết triệt để và lời khuyên hành động`
          : `Phần ${thuTu}: Đào sâu nguyên nhân và phân tích ví dụ cụ thể về ${chuDeChinh}`;

    const res = await sinhNoiDungBaiViet({
      workspaceId,
      beMat,
      yTuong: {
        tieuDe: `[Phần ${thuTu}/${soLuongBai}] ${chuDeChinh}`,
        gocTiepCan,
        truCot,
        chanDung,
      },
      mach: machCacBaiTruoc.length > 0 ? machCacBaiTruoc : undefined,
    });

    if (res.thanhCong && res.duLieu) {
      const bai = res.duLieu;
      danhSachBai.push({ ...bai, thuTu });
      machCacBaiTruoc.push(`Phần ${thuTu}: ${bai.noiDung.slice(0, 300)}...`);
    }
  }

  if (danhSachBai.length === 0) {
    return {
      thanhCong: false,
      loi: 'Không thể sinh các bài trong chuỗi.',
    };
  }

  return {
    thanhCong: true,
    duLieu: {
      chuoiId,
      chuDeChinh,
      danhSachBai,
    },
  };
}

/**
 * Luu toan bo chuoi bai vao CSDL.
 */
export async function luuChuoiBai(
  workspaceId: string,
  chuoiId: string,
  danhSachBai: (BaiVietBienSoan & { thuTu: number })[],
) {
  const repo = createRepo(workspaceId);
  const daLuu = [];

  for (const b of danhSachBai) {
    const dong = await repo.contents.tao({
      beMat: b.beMat,
      noiDung: b.noiDung,
      gocTiepCan: b.gocTiepCan ?? null,
      pillarId: b.pillarId ?? null,
      personaId: b.personaId ?? null,
      productId: b.productId ?? null,
      dangBai: 'chu',
      chuoiId,
      thuTuTrongChuoi: b.thuTu,
      trangThai: 'ban_nhap',
      nguonYTuong: 'may-de-xuat',
    });
    daLuu.push(dong);
  }

  return daLuu;
}
