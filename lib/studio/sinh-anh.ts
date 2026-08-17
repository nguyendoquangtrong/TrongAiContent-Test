/**
 * Sinh goi y visual va prompt anh cho bai dang (Studio - Moc 5).
 *
 * Tao prompt chi tiet cho Midjourney/Flux/DALL-E theo dung san pham va gu tham my cua kenh.
 */

import { createRepo } from '@/lib/data-access';
import type { GoiYVisual, KetQuaStudio } from './kieu';

export type ThamSoSinhVisual = {
  workspaceId: string;
  tieuDe: string;
  noiDung: string;
  sanPhamId?: string | null;
  dinhDang?: 'Feed' | 'Story' | 'Reels';
};

/**
 * Sinh visual concept va prompt hinh anh phu hop cho bai viet.
 */
export async function sinhVisualConcept(
  thamSo: ThamSoSinhVisual,
): Promise<KetQuaStudio<GoiYVisual>> {
  const { workspaceId, tieuDe, noiDung, sanPhamId, dinhDang = 'Feed' } = thamSo;
  const repo = createRepo(workspaceId);

  const sanPhamList = await repo.sanPham.list();
  const sanPham = sanPhamId
    ? sanPhamList.find((s: { id: string }) => s.id === sanPhamId)
    : sanPhamList[0];

  const tyLe = dinhDang === 'Story' || dinhDang === 'Reels' ? '9:16' : '1:1';

  // Tao visual prompt mang phong cach hien dai, chan thuc, toi gian
  const chuDe = sanPham?.ten ?? tieuDe;
  const moTaNgan = noiDung.slice(0, 150).replace(/\n/g, ' ');

  const promptAnh = [
    `Commercial product photography of ${chuDe},`,
    `minimalist aesthetic, soft natural daylight, cozy lifestyle background,`,
    `authentic Vietnamese setting, clean composition, high resolution, 8k, photorealistic,`,
    `mood inspired by: "${moTaNgan}",`,
    `--ar ${tyLe.replace(':', ':')}`,
  ].join(' ');

  const visual: GoiYVisual = {
    promptAnh,
    tyLe,
    phongCach: 'Minimalist & Authentic Lifestyle Photography',
    sanPhamId: sanPham?.id ?? null,
  };

  return {
    thanhCong: true,
    duLieu: visual,
  };
}

/**
 * Luu ban ghi asset anh vao CSDL.
 */
export async function luuAssetAnh(
  workspaceId: string,
  contentId: string,
  urlNgoai: string,
  tiLe: string = '1:1',
) {
  const repo = createRepo(workspaceId);
  return repo.asset.tao({
    contentId,
    loai: 'anh',
    urlNgoai,
    tiLe,
  });
}
