/**
 * Cong dem tu va kiem soat do dai cua tung be mat.
 *
 * Su dung truc tiep KHOANG_TU_BE_MAT lam nguon su that duy nhat.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { KHOANG_TU_BE_MAT } = require('@/lib/model-runner/khoang-tu-be-mat');
import type { BeMat } from './kieu';

export type TrangThaiDoDai = 'dat' | 'ngan' | 'dai';

export type KetQuaKiemTraDoDai = {
  soTu: number;
  toiThieu: number;
  toiDa: number;
  trangThai: TrangThaiDoDai;
  lech: number;
  thongBao: string;
};

/**
 * Dem so tu (tieng) theo khoang trang.
 */
export function demTu(vanBan: string): number {
  if (!vanBan) return 0;
  const sach = vanBan.trim();
  return sach === '' ? 0 : sach.split(/\s+/).length;
}

/**
 * Kiem tra do dai van ban so voi tran cua be mat.
 */
export function kiemTraDoDai(vanBan: string, beMat: BeMat): KetQuaKiemTraDoDai {
  const khoang = KHOANG_TU_BE_MAT[beMat] ?? { toiThieu: 50, toiDa: 300 };
  const soTu = demTu(vanBan);

  if (soTu < khoang.toiThieu) {
    const lech = khoang.toiThieu - soTu;
    return {
      soTu,
      toiThieu: khoang.toiThieu,
      toiDa: khoang.toiDa,
      trangThai: 'ngan',
      lech,
      thongBao: `Thiếu ${lech} từ so với chuẩn ${khoang.toiThieu}-${khoang.toiDa} từ của ${beMat}.`,
    };
  }

  if (soTu > khoang.toiDa) {
    const lech = soTu - khoang.toiDa;
    return {
      soTu,
      toiThieu: khoang.toiThieu,
      toiDa: khoang.toiDa,
      trangThai: 'dai',
      lech,
      thongBao: `Vượt ${lech} từ so với trần ${khoang.toiDa} từ của ${beMat}.`,
    };
  }

  return {
    soTu,
    toiThieu: khoang.toiThieu,
    toiDa: khoang.toiDa,
    trangThai: 'dat',
    lech: 0,
    thongBao: `Độ dài chuẩn (${soTu} từ, mức khuyến nghị ${khoang.toiThieu}-${khoang.toiDa} từ).`,
  };
}
