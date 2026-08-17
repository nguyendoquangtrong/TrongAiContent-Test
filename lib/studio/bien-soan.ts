/**
 * Bien soan bai viet tu 1 y tuong (Studio - Moc 2).
 *
 * Tuan thu cac rang buoc:
 * - Kiem tra do dai theo tung be mat (cong-dem-tu).
 * - Kiem tra vi pham quy tac ngon ngu thuong hieu (quy-tac-ngon-ngu).
 * - Kiem tra goc tiep can co bi trung voi bai cu da dang khong (timTrungGoc).
 * - Ghi nhan day du xuong CSDL qua lib/data-access/.
 */

import { quetQuyTacNgonNgu } from '@/lib/brand/quy-tac-ngon-ngu';
import { createRepo } from '@/lib/data-access';
import { chayNhiemVu } from '@/lib/model-runner';
import { demTu } from './cong-dem-tu';
import type { BaiVietBienSoan, BeMat, DangBai, KetQuaStudio } from './kieu';

export type ThamSoSinhBaiViet = {
  workspaceId: string;
  beMat: BeMat;
  yTuong: {
    tieuDe: string;
    truCot?: string | null;
    chanDung?: string | null;
    gocTiepCan?: string | null;
    cauMoDau?: string | null;
    dangBai?: DangBai;
    ideaId?: string | null;
  };
  sanPhamId?: string | null;
  epDoDai?: number;
  mach?: string[];
};

/**
 * Sinh noi dung bai viet hoan chinh tu 1 y tuong.
 */
export async function sinhNoiDungBaiViet(
  thamSo: ThamSoSinhBaiViet,
): Promise<KetQuaStudio<BaiVietBienSoan>> {
  const { workspaceId, beMat, yTuong, sanPhamId, epDoDai, mach } = thamSo;
  const repo = createRepo(workspaceId);

  // 1. Doc thong tin ho so, san pham, chan dung tu database
  const [hoSo, sanPhamList, chanDungList, truCotList] = await Promise.all([
    repo.hoSo.lay(),
    repo.sanPham.list(),
    repo.chanDung.list(),
    repo.truCot.list(),
  ]);

  // Tim san pham tuong ung hoac san pham dau tien
  const sanPham = sanPhamId
    ? sanPhamList.find((s: { id: string }) => s.id === sanPhamId)
    : sanPhamList[0];

  // Tim chan dung va tru cot khop ten
  const chanDung = yTuong.chanDung
    ? chanDungList.find((c: { ten: string }) => c.ten.toLowerCase() === yTuong.chanDung?.toLowerCase())
    : chanDungList[0];

  const truCot = yTuong.truCot
    ? truCotList.find((t: { ten: string }) => t.ten.toLowerCase() === yTuong.truCot?.toLowerCase())
    : truCotList[0];

  // 2. Chuan bi du lieu gui vao model-runner
  const duLieuVao = {
    yTuong: {
      tieuDe: yTuong.tieuDe,
      gocTiepCan: yTuong.gocTiepCan ?? null,
      cauMoDau: yTuong.cauMoDau ?? null,
      truCot: truCot?.ten ?? null,
      chanDung: chanDung?.ten ?? null,
    },
    sanPham: sanPham
      ? {
          ten: sanPham.ten,
          gia: sanPham.gia,
          loiIch: sanPham.loiIch,
          phanDoiThuongGap: sanPham.phanDoiThuongGap,
          loiKeuGoi: sanPham.loiKeuGoi,
        }
      : null,
    chanDung: chanDung
      ? {
          ten: chanDung.ten,
          noiDau: chanDung.noiDau,
          mongMuon: chanDung.mongMuon,
          cauNoiThuongDung: chanDung.cauNoiThuongDung,
        }
      : null,
    hoSo: {
      giongDieu: hoSo?.giongDieu ?? null,
      dieuCamKy: hoSo?.dieuCamKy ?? null,
    },
    epDoDai: typeof epDoDai === 'number' && epDoDai > 0 ? epDoDai : undefined,
    mach: Array.isArray(mach) && mach.length > 0 ? mach : undefined,
    beMat,
    bienThe: beMat,
  };

  // 3. Goi chayNhiemVu('viet-bai')
  let ketQuaChay;
  try {
    ketQuaChay = await chayNhiemVu({
      nhiemVu: 'viet-bai',
      duLieuVao,
      khongGianLamViec: workspaceId,
      moHinh: 'auto',
    });
  } catch (loi) {
    return {
      thanhCong: false,
      loi: (loi as Error).message ?? 'Lỗi khi gọi mô hình viết bài.',
    };
  }

  if (ketQuaChay.trangThai !== 'xong' || !ketQuaChay.ketQua) {
    return {
      thanhCong: false,
      loi: ketQuaChay.loi ?? 'Mô hình không trả về kết quả bài viết hợp lệ.',
    };
  }

  const raw = ketQuaChay.ketQua as { tieuDe?: string; noiDung?: string; hashtag?: string[] };
  const tieuDe = typeof raw.tieuDe === 'string' && raw.tieuDe.trim() !== ''
    ? raw.tieuDe.trim()
    : yTuong.tieuDe;
  const noiDung = typeof raw.noiDung === 'string' ? raw.noiDung.trim() : '';
  const hashtag = Array.isArray(raw.hashtag)
    ? raw.hashtag.filter((h): h is string => typeof h === 'string' && h.trim() !== '')
    : [];

  // 4. Kiem tra vi pham quy tac ngon ngu
  const viPhamNgonNgu = quetQuyTacNgonNgu(noiDung);

  // 5. Kiem tra trung lap goc tiep can trong 30 ngay gan nhat
  let trungGoc: {
    id: string;
    cau_mo_dau: string | null;
    goc_tiep_can: string | null;
    do_giong: number;
  }[] = [];

  if (yTuong.gocTiepCan) {
    try {
      trungGoc = await repo.contents.timTrungGoc(yTuong.gocTiepCan, 0.6, 30, 3);
    } catch {
      // Neu timTrungGoc khong kha dung thi bo qua
    }
  }

  const baiViet: BaiVietBienSoan = {
    tieuDe,
    noiDung,
    hashtag,
    cauMoDau: yTuong.cauMoDau ?? null,
    beMat,
    pillarId: truCot?.id ?? null,
    personaId: chanDung?.id ?? null,
    productId: sanPham?.id ?? null,
    gocTiepCan: yTuong.gocTiepCan ?? null,
    dangBai: yTuong.dangBai ?? 'chu',
    ideaId: yTuong.ideaId ?? null,
    moHinhDaSinh: ketQuaChay.moHinh,
    soTu: demTu(noiDung),
    viPhamNgonNgu,
    trungGoc,
  };

  return {
    thanhCong: true,
    duLieu: baiViet,
  };
}

/**
 * Luu bai viet vao bang `contents`.
 */
export async function luuBaiViet(
  workspaceId: string,
  baiViet: BaiVietBienSoan,
  trangThai: 'ban_nhap' | 'san_sang' | 'da_dang' = 'ban_nhap',
) {
  const repo = createRepo(workspaceId);

  const dong = await repo.contents.tao({
    beMat: baiViet.beMat,
    noiDung: baiViet.noiDung,
    cauMoDau: baiViet.cauMoDau ?? null,
    gocTiepCan: baiViet.gocTiepCan ?? null,
    pillarId: baiViet.pillarId ?? null,
    personaId: baiViet.personaId ?? null,
    productId: baiViet.productId ?? null,
    ideaId: baiViet.ideaId ?? null,
    dangBai: baiViet.dangBai ?? 'chu',
    moHinhDaSinh: baiViet.moHinhDaSinh ?? null,
    trangThai,
    nguonYTuong: baiViet.ideaId ? 'may-de-xuat' : 'nguoi-tu-nhap',
  });

  return dong;
}
