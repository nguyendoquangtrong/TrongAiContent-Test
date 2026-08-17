/**
 * Sinh kich ban quay video ngan theo phan canh (Studio - Moc 3).
 *
 * Cau truc phan canh gom: thoiLuongGiay, hinhAnh (goc quay, hanh dong), loiThoai.
 */

import { createRepo } from '@/lib/data-access';
import { chayNhiemVu } from '@/lib/model-runner';
import type { BeMat, KetQuaStudio, KichBanVideo, PhanCanhVideo } from './kieu';

export type ThamSoSinhKichBan = {
  workspaceId: string;
  beMat?: BeMat;
  yTuong: {
    tieuDe: string;
    gocTiepCan?: string | null;
    cauMoDau?: string | null;
    truCot?: string | null;
    chanDung?: string | null;
  };
  noiDungBaiViet?: string;
  sanPhamId?: string | null;
};

/**
 * Don ket qua tho tu mo hinh thanh KichBanVideo hop le.
 */
export function donKetQuaKichBan(tho: unknown, tieuDeMacDinh: string): KichBanVideo {
  if (!tho || typeof tho !== 'object') {
    return { tieuDe: tieuDeMacDinh, phanCanh: [], tongThoiLuongGiay: 0 };
  }

  const raw = tho as { tieuDe?: string; phanCanh?: unknown[] };
  const tieuDe = typeof raw.tieuDe === 'string' && raw.tieuDe.trim() !== ''
    ? raw.tieuDe.trim()
    : tieuDeMacDinh;

  const phanCanhList = Array.isArray(raw.phanCanh) ? raw.phanCanh : [];
  const phanCanh: PhanCanhVideo[] = [];
  let tongThoiLuong = 0;

  for (const pc of phanCanhList) {
    if (!pc || typeof pc !== 'object') continue;
    const r = pc as Record<string, unknown>;

    const thoiLuongGiay = typeof r.thoiLuongGiay === 'number' && Number.isFinite(r.thoiLuongGiay)
      ? Math.max(1, Math.round(r.thoiLuongGiay))
      : 5;

    const hinhAnh = typeof r.hinhAnh === 'string' && r.hinhAnh.trim() !== ''
      ? r.hinhAnh.trim()
      : 'Quay chính diện người nói/demo sản phẩm.';

    const loiThoai = typeof r.loiThoai === 'string' && r.loiThoai.trim() !== ''
      ? r.loiThoai.trim()
      : '...';

    phanCanh.push({ thoiLuongGiay, hinhAnh, loiThoai });
    tongThoiLuong += thoiLuongGiay;
  }

  return {
    tieuDe,
    phanCanh,
    tongThoiLuongGiay: tongThoiLuong,
  };
}

/**
 * Cua chinh: Sinh kich ban quay video phan canh tu 1 y tuong hoac bai viet.
 */
export async function sinhKichBan(
  thamSo: ThamSoSinhKichBan,
): Promise<KetQuaStudio<KichBanVideo>> {
  const { workspaceId, beMat = 'tiktok', yTuong, noiDungBaiViet, sanPhamId } = thamSo;
  const repo = createRepo(workspaceId);

  // 1. Doc thong tin san pham va ho so
  const [hoSo, sanPhamList] = await Promise.all([
    repo.hoSo.lay(),
    repo.sanPham.list(),
  ]);

  const sanPham = sanPhamId
    ? sanPhamList.find((s: { id: string }) => s.id === sanPhamId)
    : sanPhamList[0];

  // 2. Chuan bi du lieu gui vao model-runner
  const duLieuVao = {
    yTuong: {
      tieuDe: yTuong.tieuDe,
      gocTiepCan: yTuong.gocTiepCan ?? null,
      cauMoDau: yTuong.cauMoDau ?? null,
    },
    noiDungBaiViet: noiDungBaiViet ?? null,
    sanPham: sanPham
      ? {
          ten: sanPham.ten,
          gia: sanPham.gia,
          loiIch: sanPham.loiIch,
          loiKeuGoi: sanPham.loiKeuGoi,
        }
      : null,
    hoSo: {
      giongDieu: hoSo?.giongDieu ?? null,
      dieuCamKy: hoSo?.dieuCamKy ?? null,
    },
    beMat,
    bienThe: beMat,
  };

  // 3. Goi chayNhiemVu('viet-kich-ban')
  let ketQuaChay;
  try {
    ketQuaChay = await chayNhiemVu({
      nhiemVu: 'viet-kich-ban',
      duLieuVao,
      khongGianLamViec: workspaceId,
      moHinh: 'auto',
    });
  } catch (loi) {
    return {
      thanhCong: false,
      loi: (loi as Error).message ?? 'Lỗi khi gọi mô hình viết kịch bản.',
    };
  }

  if (ketQuaChay.trangThai !== 'xong' || !ketQuaChay.ketQua) {
    return {
      thanhCong: false,
      loi: ketQuaChay.loi ?? 'Mô hình không trả về kịch bản hợp lệ.',
    };
  }

  const kichBan = donKetQuaKichBan(ketQuaChay.ketQua, yTuong.tieuDe);

  return {
    thanhCong: true,
    duLieu: kichBan,
  };
}
