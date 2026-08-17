/**
 * Kieu du lieu dung chung cho toan bo Studio (Phase 9 + Mo rong).
 *
 * Tuan thu dung hop dong duoc quy dinh o TEST-BRIEF.md muc 4.
 */

import type { ViPhamNgonNgu } from '@/lib/brand/quy-tac-ngon-ngu';

export type BeMat = 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo';

export type DangBai = 'chu' | 'anh_chu' | 'kich_ban_quay';

/**
 * Hop dong bat buoc cua YTuongDeXuat tu TEST-BRIEF.md.
 */
export type YTuongDeXuat = {
  id?: string;
  ideaId?: string | null;
  tieuDe: string;
  truCot: string | null;      // phai khop mot tru cot CO THAT trong ho so, khong khop thi null
  chanDung: string | null;    // phai khop mot chan dung CO THAT trong ho so, khong khop thi null
  gocTiepCan: string | null;
  cauMoDau: string | null;
  lyDoDeXuat: string | null;
  beMat: BeMat;
  khamPha: boolean;           // y tuong do duong, thuoc tuyen chua co du lieu
  trendSignalId?: string | null;
  tenKenhNguon?: string | null;
  urlKenhNguon?: string | null;
  lienKetNguon?: string | null;
  productId?: string | null;
  dangBai?: DangBai;
  daDung?: boolean;
};

export type KetQuaStudio<T> = {
  thanhCong: boolean;
  duLieu?: T;
  loi?: string;
  canhBao?: string[];
  doDayDu?: {
    phanTram: number;
    duocPhep: boolean;
    lyDo: string | null;
  };
};

export type BaiVietBienSoan = {
  id?: string;
  tieuDe: string;
  noiDung: string;
  hashtag: string[];
  cauMoDau?: string | null;
  beMat: BeMat;
  pillarId?: string | null;
  personaId?: string | null;
  productId?: string | null;
  gocTiepCan?: string | null;
  dangBai?: DangBai;
  ideaId?: string | null;
  moHinhDaSinh?: string | null;
  soTu?: number;
  viPhamNgonNgu?: ViPhamNgonNgu[];
  trungGoc?: {
    id: string;
    cau_mo_dau: string | null;
    goc_tiep_can: string | null;
    do_giong: number;
  }[];
};

export type PhanCanhVideo = {
  thoiLuongGiay: number;
  hinhAnh: string;
  loiThoai: string;
};

export type KichBanVideo = {
  tieuDe: string;
  phanCanh: PhanCanhVideo[];
  tongThoiLuongGiay?: number;
};

export type KhungGioDang = {
  id: string;
  khungGio: string;
  gio: string;
  dinhDang: 'Feed' | 'Story' | 'Reels';
  mucTieu: string;
};

export type GoiYVisual = {
  promptAnh: string;
  tyLe: string;
  phongCach: string;
  sanPhamId?: string | null;
};
