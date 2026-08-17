/**
 * May de xuat y tuong noi dung (Studio - Moc 1).
 *
 * Tuan thu cac rang buoc bat buoc tu TEST-BRIEF.md:
 * 1. Moi truy van di qua lib/data-access/.
 * 2. Khong bia tru cot va chan dung (khong khop thi dat null).
 * 3. Hoc cach ke, khong chep bai (chi truyen chu de va cong thuc ke o tang ma).
 * 4. Y tuong sinh tu tin hieu tham khao phai tro ve dung bai da goi y no.
 */

import { kiemTraDeXuat } from '@/lib/brand/do-day-du';
import { createRepo } from '@/lib/data-access';
import { chayNhiemVu } from '@/lib/model-runner';
import type { BeMat, KetQuaStudio, YTuongDeXuat } from './kieu';

export const TI_LE_KHAM_PHA = 0.2;

export type ThamSoDeXuat = {
  workspaceId: string;
  beMat: BeMat;          // 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo'
  soLuong: number;
  userId?: string;
};

export type TruCotMucTieu = { ten: string; tiLeMucTieu: number | null };

type TinHieuThamKhao = {
  id: string;
  tenKenh?: string | null;
  urlKenh?: string | null;
  lienKet?: string | null;
  chuDe?: string[];
  kieuHook?: string | null;
};

/**
 * Don ket qua tho cua mo hinh ve dung hinh dang YTuongDeXuat[].
 *
 * Rang buoc: Khong bia tru cot va chan dung — neu ten khong khop ho so thi dat null.
 */
export function donKetQuaDeXuat(
  tho: unknown,
  danhSachTruCot: string[] = [],
  danhSachChanDung: string[] = [],
  beMat: BeMat = 'fanpage',
  tiLeKhamPha: number = TI_LE_KHAM_PHA,
  tinHieuMap?: Map<string, TinHieuThamKhao>,
): YTuongDeXuat[] {
  if (!tho || typeof tho !== 'object') return [];

  const rawList: unknown[] = Array.isArray((tho as { yTuong?: unknown }).yTuong)
    ? ((tho as { yTuong: unknown[] }).yTuong)
    : Array.isArray(tho)
      ? tho
      : [];

  // Tao map khong phan biet chu hoa/thuong de so khop chuan xac
  const mapTruCot = new Map<string, string>();
  for (const tc of danhSachTruCot) {
    if (typeof tc === 'string' && tc.trim() !== '') {
      mapTruCot.set(tc.trim().toLowerCase(), tc.trim());
    }
  }

  const mapChanDung = new Map<string, string>();
  for (const cd of danhSachChanDung) {
    if (typeof cd === 'string' && cd.trim() !== '') {
      mapChanDung.set(cd.trim().toLowerCase(), cd.trim());
    }
  }

  const ketQua: YTuongDeXuat[] = [];

  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;

    const tieuDe = typeof r.tieuDe === 'string' ? r.tieuDe.trim() : '';
    if (!tieuDe) continue;

    // So khop tru cot
    let truCot: string | null = null;
    if (typeof r.truCot === 'string' && r.truCot.trim() !== '') {
      const chuan = r.truCot.trim().toLowerCase();
      truCot = mapTruCot.get(chuan) ?? null;
    }

    // So khop chan dung
    let chanDung: string | null = null;
    if (typeof r.chanDung === 'string' && r.chanDung.trim() !== '') {
      const chuan = r.chanDung.trim().toLowerCase();
      chanDung = mapChanDung.get(chuan) ?? null;
    }

    const gocTiepCan = typeof r.gocTiepCan === 'string' && r.gocTiepCan.trim() !== ''
      ? r.gocTiepCan.trim()
      : null;

    const cauMoDau = typeof r.cauMoDau === 'string' && r.cauMoDau.trim() !== ''
      ? r.cauMoDau.trim()
      : null;

    const lyDoDeXuat = typeof r.lyDoDeXuat === 'string' && r.lyDoDeXuat.trim() !== ''
      ? r.lyDoDeXuat.trim()
      : null;

    const beMatItem: BeMat =
      typeof r.beMat === 'string' && ['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo'].includes(r.beMat)
        ? (r.beMat as BeMat)
        : beMat;

    const khamPha = r.kham_pha === true || r.khamPha === true;

    // Tim tin hieu goc neu duoc de cap trong ly do de xuat hoac r.trendSignalId
    let trendSignalId: string | null = null;
    let tenKenhNguon: string | null = null;
    let urlKenhNguon: string | null = null;
    let lienKetNguon: string | null = null;

    if (typeof r.trendSignalId === 'string' && tinHieuMap?.has(r.trendSignalId)) {
      trendSignalId = r.trendSignalId;
      const th = tinHieuMap.get(r.trendSignalId);
      tenKenhNguon = th?.tenKenh ?? null;
      urlKenhNguon = th?.urlKenh ?? null;
      lienKetNguon = th?.lienKet ?? null;
    } else if (tinHieuMap && lyDoDeXuat) {
      for (const [sigId, th] of tinHieuMap.entries()) {
        if (lyDoDeXuat.includes(sigId) || (th.tenKenh && lyDoDeXuat.includes(th.tenKenh))) {
          trendSignalId = sigId;
          tenKenhNguon = th.tenKenh ?? null;
          urlKenhNguon = th.urlKenh ?? null;
          lienKetNguon = th.lienKet ?? null;
          break;
        }
      }
    }

    ketQua.push({
      tieuDe,
      truCot,
      chanDung,
      gocTiepCan,
      cauMoDau,
      lyDoDeXuat,
      beMat: beMatItem,
      khamPha,
      trendSignalId,
      tenKenhNguon,
      urlKenhNguon,
      lienKetNguon,
    });
  }

  return ketQua;
}

/**
 * Rai N y tuong theo ti le tru cot muc tieu.
 */
export function raiTheoTruCot(
  yTuongTho: YTuongDeXuat[],
  truCotMucTieu: TruCotMucTieu[],
  soLuong: number,
): YTuongDeXuat[] {
  if (yTuongTho.length === 0 || soLuong <= 0) return [];
  if (yTuongTho.length <= soLuong && truCotMucTieu.length === 0) {
    return yTuongTho;
  }

  // Phan nhom y tuong theo tru cot
  const theoTruCot = new Map<string, YTuongDeXuat[]>();
  const khongTruCot: YTuongDeXuat[] = [];

  for (const yt of yTuongTho) {
    if (yt.truCot) {
      const co = theoTruCot.get(yt.truCot) ?? [];
      co.push(yt);
      theoTruCot.set(yt.truCot, co);
    } else {
      khongTruCot.push(yt);
    }
  }

  // Tinh so luong can lay cho tung tru cot
  const danhSachHopLe = truCotMucTieu.filter((t) => typeof t.ten === 'string' && t.ten.trim() !== '');
  const soTruCot = danhSachHopLe.length;

  const chiTieu = new Map<string, number>();

  if (soTruCot > 0) {
    const tongTiLe = danhSachHopLe.reduce((acc, cur) => acc + (cur.tiLeMucTieu ?? 0), 0);

    if (tongTiLe > 0) {
      let daPhan = 0;
      for (const tc of danhSachHopLe) {
        const tiLe = (tc.tiLeMucTieu ?? 0) / tongTiLe;
        const sl = Math.round(soLuong * tiLe);
        chiTieu.set(tc.ten, sl);
        daPhan += sl;
      }
      // Can bang neu lech tong
      const lech = soLuong - daPhan;
      if (lech !== 0 && danhSachHopLe.length > 0) {
        const tenDau = danhSachHopLe[0].ten;
        chiTieu.set(tenDau, Math.max(0, (chiTieu.get(tenDau) ?? 0) + lech));
      }
    } else {
      // Chia deu neu khong co ti le cu the
      const moiTruCot = Math.floor(soLuong / soTruCot);
      let du = soLuong % soTruCot;
      for (const tc of danhSachHopLe) {
        const them = du > 0 ? 1 : 0;
        if (du > 0) du -= 1;
        chiTieu.set(tc.ten, moiTruCot + them);
      }
    }
  }

  const ketQua: YTuongDeXuat[] = [];
  const chuaChon: YTuongDeXuat[] = [];

  // Lay theo chi tieu tung tru cot
  for (const [tenTc, danhSach] of theoTruCot.entries()) {
    const canLay = chiTieu.get(tenTc) ?? 0;
    const lay = danhSach.slice(0, canLay);
    ketQua.push(...lay);
    if (danhSach.length > canLay) {
      chuaChon.push(...danhSach.slice(canLay));
    }
  }

  // Don ca cac bai khong co tru cot vao hang cho
  chuaChon.push(...khongTruCot);

  // Neu chua du soLuong, bo sung tu cac y tuong con lai
  while (ketQua.length < soLuong && chuaChon.length > 0) {
    const tiep = chuaChon.shift();
    if (tiep) ketQua.push(tiep);
  }

  return ketQua.slice(0, soLuong);
}

/**
 * Cua chinh: doc ho so, goi mo hinh, don, rai, tra ket qua.
 */
export async function deXuatYTuong(
  thamSo: ThamSoDeXuat,
): Promise<KetQuaStudio<YTuongDeXuat[]>> {
  const { workspaceId, beMat, soLuong } = thamSo;
  const repo = createRepo(workspaceId);

  // 1. Doc 4 nguon du lieu tu database
  const [hoSo, truCot, chanDung, sanPham, insight, baiDaDang] = await Promise.all([
    repo.hoSo.lay(),
    repo.truCot.list(),
    repo.chanDung.list(),
    repo.sanPham.list(),
    repo.insight.list(),
    repo.contents.list({ trangThai: 'da_dang', gioiHan: 10 }),
  ]);

  // 2. Kiem tra do day du ho so (PRD F2: chan duoi 60%)
  const kiemDinh = kiemTraDeXuat({ truCot, chanDung, sanPham, insight, hoSo });
  if (!kiemDinh.duocPhep) {
    return {
      thanhCong: false,
      loi: kiemDinh.lyDo ?? 'Hồ sơ thương hiệu chưa đủ điều kiện đề xuất.',
      doDayDu: kiemDinh,
    };
  }

  // 3. Lay tin hieu xu huong tu cac kenh theo doi (neu co)
  // RANG BUOC BAT BUOC: Chi boc CHU DE va CONG THUC KE, TUYET DOI KHONG truyen noi dung tho
  let tinHieuChon: {
    id: string;
    chuDe: string[];
    kieuHook: string | null;
    coCTA: boolean;
    dangBai: string | null;
    soThich: number | null;
  }[] = [];

  const tinHieuMap = new Map<string, TinHieuThamKhao>();

  try {
    // Lay tin hieu da duoc boc cong thuc
    const tinHieuTho = await repo.tinHieuXuHuong.chiemBaiChuaBoc(0); // lay danh sach
    // Neu co bai chua dung thi lay de tham khao
    const danhSachTinHieu = await repo.tinHieuXuHuong.theoNguoiDungDeTraCuu(
      { userId: thamSo.userId || '00000000-0000-0000-0000-000000000000' } as never,
      20,
    ).catch(() => []);

    for (const th of danhSachTinHieu) {
      tinHieuMap.set(th.id, {
        id: th.id,
        tenKenh: th.tenKenh,
        urlKenh: th.urlKenh,
        lienKet: th.lienKet,
      });
    }

    tinHieuChon = danhSachTinHieu.slice(0, 8).map((th) => ({
      id: th.id,
      // CHI truyen chu de va dang bai, KHONG truyen noiDung
      chuDe: [],
      kieuHook: null,
      coCTA: false,
      dangBai: th.dangBai ?? null,
      soThich: th.soThich ?? null,
    }));
  } catch {
    // Khong co tin hieu kenh ngoai thi van tiep tuc voi cac nguon noi bo
  }

  // 4. Analytics Loop: Chon cac bai da dang hieu qua cao va y tuong da co de tranh trung lap
  const baiHieuQua = baiDaDang.slice(0, 5).map((b) => ({
    gocTiepCan: b.gocTiepCan,
    cauMoDau: b.cauMoDau,
    dangBai: b.dangBai,
  }));

  const yTuongDaCo = await repo.yTuong.list(20).catch(() => []);
  const gocDaCo = yTuongDaCo.map((y: { gocTiepCan?: string | null }) => y.gocTiepCan).filter(Boolean);

  // 5. Chuan bi payload gui mo hinh qua lop rao du lieu
  const duLieuVao = {
    hoSo: {
      giongDieu: hoSo?.giongDieu ?? null,
      dieuCamKy: hoSo?.dieuCamKy ?? null,
      moTa: hoSo?.moTa ?? null,
    },
    truCot: truCot.map((t: { ten: string; mucDich?: string | null; tiLeMucTieu?: number | null }) => ({ ten: t.ten, mucDich: t.mucDich, tiLeMucTieu: t.tiLeMucTieu })),
    chanDung: chanDung.map((c: { ten: string; noiDau?: string | null; mongMuon?: string | null }) => ({ ten: c.ten, noiDau: c.noiDau, mongMuon: c.mongMuon })),
    sanPham: sanPham.map((s: { ten: string; gia?: string | null; loiIch?: string | null; loiKeuGoi?: string | null }) => ({ ten: s.ten, gia: s.gia, loiIch: s.loiIch, loiKeuGoi: s.loiKeuGoi })),
    insight: insight.map((i: { noiDung: string; bangChung?: string | null }) => ({ noiDung: i.noiDung, bangChung: i.bangChung })),
    baiDaDangThamKhao: baiHieuQua,
    gocDaCo: gocDaCo.slice(0, 10),
    tinHieuXuHuong: tinHieuChon,
    beMat,
    soLuongYeuCau: Math.max(soLuong * 2, 10), // Sinh ung vien du de loc va rai theo ti le
    tiLeKhamPha: TI_LE_KHAM_PHA,
    bienThe: beMat,
  };

  // 6. Goi mo hinh qua chayNhiemVu (dua vao hang doi)
  let ketQuaChay;
  try {
    ketQuaChay = await chayNhiemVu({
      nhiemVu: 'de-xuat-y-tuong',
      duLieuVao,
      khongGianLamViec: workspaceId,
      moHinh: 'auto',
    });
  } catch (loi) {
    return {
      thanhCong: false,
      loi: (loi as Error).message ?? 'Lỗi khi gọi mô hình đề xuất ý tưởng.',
      doDayDu: kiemDinh,
    };
  }

  if (ketQuaChay.trangThai !== 'xong' || !ketQuaChay.ketQua) {
    return {
      thanhCong: false,
      loi: ketQuaChay.loi ?? 'Mô hình không trả về kết quả hợp lệ.',
      doDayDu: kiemDinh,
    };
  }

  // 7. Don ket qua va rai theo tru cot muc tieu
  const danhSachTenTruCot = truCot.map((t: { ten: string }) => t.ten);
  const danhSachTenChanDung = chanDung.map((c: { ten: string }) => c.ten);

  const yTuongTho = donKetQuaDeXuat(
    ketQuaChay.ketQua,
    danhSachTenTruCot,
    danhSachTenChanDung,
    beMat,
    TI_LE_KHAM_PHA,
    tinHieuMap,
  );

  const truCotMucTieu: TruCotMucTieu[] = truCot.map((t: { ten: string; tiLeMucTieu?: number | null }) => ({
    ten: t.ten,
    tiLeMucTieu: t.tiLeMucTieu ?? null,
  }));

  const yTuongDaRai = raiTheoTruCot(yTuongTho, truCotMucTieu, soLuong);

  // 8. Tu dong luu cac y tuong vao kho database (ideas table) de khong bi mat khi refresh trang
  const yTuongKemId: YTuongDeXuat[] = [];
  for (const yt of yTuongDaRai) {
    const truCotKhop = yt.truCot ? truCot.find((t: { ten: string }) => t.ten.toLowerCase() === yt.truCot?.toLowerCase()) : null;
    const chanDungKhop = yt.chanDung ? chanDung.find((c: { ten: string }) => c.ten.toLowerCase() === yt.chanDung?.toLowerCase()) : null;

    try {
      const dong = await repo.yTuong.tao({
        beMat: yt.beMat,
        gocTiepCan: yt.gocTiepCan ?? yt.tieuDe,
        cauMoDau: yt.cauMoDau ?? null,
        lyDoDeXuat: yt.lyDoDeXuat ?? null,
        pillarId: truCotKhop ? (truCotKhop as { id: string }).id : null,
        personaId: chanDungKhop ? (chanDungKhop as { id: string }).id : null,
        trendSignalId: yt.trendSignalId ?? null,
        nguonYTuong: yt.trendSignalId ? 'xu-huong' : 'may-de-xuat',
        daDung: false,
      });
      yTuongKemId.push({ ...yt, ideaId: dong.id });
    } catch {
      yTuongKemId.push(yt);
    }
  }

  return {
    thanhCong: true,
    duLieu: yTuongKemId,
    doDayDu: kiemDinh,
  };
}
