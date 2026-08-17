/**
 * Sinh hang loat noi dung — phuc vu muc tieu dang 10 bai Facebook moi ngay (Studio - Moc 4).
 *
 * Tich hop:
 * - Phan bo da dinh dang (Feed dai, Feed ngan, Story, Kich ban Reels)
 * - Phan bo khung gio vang trong ngay
 * - Can bang theo ti le tru cot noi dung
 * - Luu hang loat vao kho bai chi voi 1 cham
 */

import { createRepo } from '@/lib/data-access';
import { deXuatYTuong } from './de-xuat';
import { sinhNoiDungBaiViet } from './bien-soan';
import { sinhKichBan } from './kich-ban';
import type { BaiVietBienSoan, BeMat, DangBai, KetQuaStudio, KhungGioDang, KichBanVideo, YTuongDeXuat } from './kieu';

export const KHUNG_GIO_VANG_10_BAI: KhungGioDang[] = [
  { id: '1', khungGio: 'Sáng sớm (07:15)', gio: '07:15', dinhDang: 'Story', mucTieu: 'Chào ngày mới, truyền cảm hứng & mở tương tác' },
  { id: '2', khungGio: 'Đầu giờ sáng (08:30)', gio: '08:30', dinhDang: 'Feed', mucTieu: 'Mẹo nhanh, kiến thức hữu ích 1 phút' },
  { id: '3', khungGio: 'Giữa sáng (10:00)', gio: '10:00', dinhDang: 'Feed', mucTieu: 'Phân tích nỗi đau khách hàng & tình huống thực tế' },
  { id: '4', khungGio: 'Nghỉ trưa (11:45)', gio: '11:45', dinhDang: 'Reels', mucTieu: 'Video ngắn demo sản phẩm / giải pháp' },
  { id: '5', khungGio: 'Đầu giờ chiều (13:30)', gio: '13:30', dinhDang: 'Feed', mucTieu: 'Case study khách hàng thật, feedback' },
  { id: '6', khungGio: 'Xế chiều (15:00)', gio: '15:00', dinhDang: 'Feed', mucTieu: 'Giải đáp câu hỏi thường gặp (FAQ)' },
  { id: '7', khungGio: 'Tan tầm (17:15)', gio: '17:15', dinhDang: 'Story', mucTieu: 'Chuyện hậu trường, quy trình đóng gói / phục vụ' },
  { id: '8', khungGio: 'Giờ vàng tối (19:45)', gio: '19:45', dinhDang: 'Feed', mucTieu: 'Bài phân tích sâu, đòn bẩy niềm tin & chuyển đổi' },
  { id: '9', khungGio: 'Giải trí tối (21:00)', gio: '21:00', dinhDang: 'Reels', mucTieu: 'Video ngắn tình huống hài hước / trước-sau' },
  { id: '10', khungGio: 'Trước khi ngủ (22:15)', gio: '22:15', dinhDang: 'Feed', mucTieu: 'Tâm sự, bài học kinh doanh & chúc ngủ ngon' },
];

export type ItemHangLoat = {
  id: string;
  khungGio: KhungGioDang;
  yTuong: YTuongDeXuat;
  baiViet?: BaiVietBienSoan;
  kichBan?: KichBanVideo;
  dangBai: DangBai;
  duocChon: boolean;
};

export type ThamSoSinhHangLoat = {
  workspaceId: string;
  beMat?: BeMat;
  soLuong?: number;
  userId?: string;
};

export type KetQuaHangLoat = {
  tongSo: number;
  danhSach: ItemHangLoat[];
};

/**
 * Sinh mot lo bai dang theo lich trinh 10 bai moi ngay.
 */
export async function sinhLo10Bai(
  thamSo: ThamSoSinhHangLoat,
): Promise<KetQuaStudio<KetQuaHangLoat>> {
  const { workspaceId, beMat = 'fanpage', soLuong = 10, userId } = thamSo;

  // 1. Sinh danh sach N y tuong can bang theo tru cot
  const ketQuaYTuong = await deXuatYTuong({
    workspaceId,
    beMat,
    soLuong,
    userId,
  });

  if (!ketQuaYTuong.thanhCong || !ketQuaYTuong.duLieu || ketQuaYTuong.duLieu.length === 0) {
    return {
      thanhCong: false,
      loi: ketQuaYTuong.loi ?? 'Không sinh được danh sách ý tưởng cho lô bài.',
      doDayDu: ketQuaYTuong.doDayDu,
    };
  }

  const yTuongList = ketQuaYTuong.duLieu;
  // 2. Map tung y tuong vao khung gio vang va sinh noi dung song song (Parallel execution)
  const danhSach: ItemHangLoat[] = await Promise.all(
    yTuongList.slice(0, soLuong).map(async (yTuong, i) => {
      const khungGio = KHUNG_GIO_VANG_10_BAI[i % KHUNG_GIO_VANG_10_BAI.length];
      const dangBai: DangBai = khungGio.dinhDang === 'Reels' ? 'kich_ban_quay' : 'chu';

      let baiViet: BaiVietBienSoan | undefined;
      let kichBan: KichBanVideo | undefined;

      try {
        if (dangBai === 'kich_ban_quay') {
          const resKb = await sinhKichBan({
            workspaceId,
            beMat: 'tiktok',
            yTuong: {
              tieuDe: yTuong.tieuDe,
              gocTiepCan: yTuong.gocTiepCan,
              cauMoDau: yTuong.cauMoDau,
              truCot: yTuong.truCot,
              chanDung: yTuong.chanDung,
            },
          });
          if (resKb.thanhCong && resKb.duLieu) {
            kichBan = resKb.duLieu;
          }
        } else {
          const resBv = await sinhNoiDungBaiViet({
            workspaceId,
            beMat,
            yTuong: {
              tieuDe: yTuong.tieuDe,
              truCot: yTuong.truCot,
              chanDung: yTuong.chanDung,
              gocTiepCan: yTuong.gocTiepCan,
              cauMoDau: yTuong.cauMoDau,
              dangBai,
            },
          });
          if (resBv.thanhCong && resBv.duLieu) {
            baiViet = resBv.duLieu;
          }
        }
      } catch {
        // Tiep tuc de tao ban nhap ma khong lam hong ca lo bai
      }

      // Ban nhap du phong neu AI chua kip tra ve
      if (!baiViet && !kichBan) {
        if (dangBai === 'kich_ban_quay') {
          kichBan = {
            tieuDe: yTuong.tieuDe,
            phanCanh: [
              { thoiLuongGiay: 4, hinhAnh: 'Góc cận cảnh thể hiện cảm xúc bất ngờ hoặc giơ sản phẩm', loiThoai: yTuong.cauMoDau || 'Dừng lại nếu bạn quan tâm đến giải pháp này!' },
              { thoiLuongGiay: 15, hinhAnh: 'Góc trung cảnh thao tác hướng dẫn chi tiết quy trình', loiThoai: yTuong.gocTiepCan || 'Đây là bí quyết tối ưu hóa hiệu quả nhanh chóng.' },
              { thoiLuongGiay: 5, hinhAnh: 'Góc chính diện kêu gọi bình luận và chia sẻ', loiThoai: 'Để lại bình luận hoặc nhắn tin ngay để nhận thêm tài liệu chi tiết nhé!' },
            ],
            tongThoiLuongGiay: 24,
          };
        } else {
          const noiDungMau = yTuong.cauMoDau
            ? `${yTuong.cauMoDau}\n\n${yTuong.gocTiepCan || 'Chia sẻ kinh nghiệm thực tế giúp nâng cao hiệu suất công việc mỗi ngày.'}\n\nNếu bạn thấy bài viết hữu ích, hãy để lại tương tác và chia sẻ nhé!`
            : `${yTuong.tieuDe}\n\n${yTuong.gocTiepCan || 'Nội dung chia sẻ giá trị hữu ích dành cho khách hàng.'}`;

          baiViet = {
            tieuDe: yTuong.tieuDe,
            noiDung: noiDungMau,
            hashtag: ['#kinhdoanh', '#marketing', '#aistudio'],
            beMat,
          };
        }
      }

      return {
        id: `hang-loat-${i + 1}`,
        khungGio,
        yTuong,
        baiViet,
        kichBan,
        dangBai,
        duocChon: true,
      };
    })
  );

  return {
    thanhCong: true,
    duLieu: {
      tongSo: danhSach.length,
      danhSach,
    },
    doDayDu: ketQuaYTuong.doDayDu,
  };
}

/**
 * Luu toan bo cac bai duoc chon vao kho bai viet trong database.
 */
export async function luuLoHangLoat(
  workspaceId: string,
  danhSach: ItemHangLoat[],
  trangThai: 'ban_nhap' | 'san_sang' = 'san_sang',
): Promise<{ soLuongLuu: number }> {
  const repo = createRepo(workspaceId);
  let soLuongLuu = 0;

  for (const item of danhSach) {
    if (!item.duocChon) continue;

    const noiDung = item.dangBai === 'kich_ban_quay' && item.kichBan
      ? JSON.stringify(item.kichBan.phanCanh)
      : (item.baiViet?.noiDung ?? item.yTuong.tieuDe);

    await repo.contents.tao({
      beMat: item.yTuong.beMat,
      noiDung,
      cauMoDau: item.yTuong.cauMoDau ?? null,
      gocTiepCan: item.yTuong.gocTiepCan ?? null,
      dangBai: item.dangBai,
      moHinhDaSinh: item.baiViet?.moHinhDaSinh ?? 'auto',
      trangThai,
      nguonYTuong: 'may-de-xuat',
    });

    soLuongLuu += 1;
  }

  return { soLuongLuu };
}
