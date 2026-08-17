/**
 * So sanh 4 giong cua 4 be mat canh nhau (Studio - So giong).
 *
 * Sinh dong thoi 4 ban: Fanpage, Ho so ca nhan, TikTok, Zalo tu cung 1 y tuong goc.
 */

import { sinhNoiDungBaiViet } from './bien-soan';
import type { BaiVietBienSoan, BeMat, KetQuaStudio } from './kieu';

export type ThamSoSoGiong = {
  workspaceId: string;
  yTuong: {
    tieuDe: string;
    gocTiepCan?: string | null;
    truCot?: string | null;
    chanDung?: string | null;
  };
  sanPhamId?: string | null;
};

export type KetQuaSoGiong = Record<BeMat, BaiVietBienSoan | null>;

/**
 * Sinh 4 phien ban cho 4 be mat.
 */
export async function soGiongBonBeMat(
  thamSo: ThamSoSoGiong,
): Promise<KetQuaStudio<KetQuaSoGiong>> {
  const { workspaceId, yTuong, sanPhamId } = thamSo;
  const beMatList: BeMat[] = ['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo'];

  const ketQua: KetQuaSoGiong = {
    fanpage: null,
    ho_so_ca_nhan: null,
    tiktok: null,
    zalo: null,
  };

  const prom = beMatList.map(async (beMat) => {
    const res = await sinhNoiDungBaiViet({
      workspaceId,
      beMat,
      yTuong,
      sanPhamId,
    });
    if (res.thanhCong && res.duLieu) {
      ketQua[beMat] = res.duLieu;
    }
  });

  await Promise.all(prom);

  return {
    thanhCong: true,
    duLieu: ketQua,
  };
}
