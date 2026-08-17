import type { Metadata } from 'next';
import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { Icon } from '../../sprite-icon';
import { BangBaiDaTao, type BaiDaTaoItem } from './bang-bai-da-tao';
import '../brand/brand.css';
import '../studio/studio.css';

export const metadata: Metadata = {
  title: 'Bài đã tạo — AI Content Studio',
};

export default async function TrangBaiDaTao() {
  const workspaceId = await workspaceHienTai();
  const repo = createRepo(workspaceId);

  // Lay tat ca noi dung da sinh tu studio (san_sang, ban_nhap, da_dang, y_tuong)
  const danhSachContent = await repo.contents.list({ gioiHan: 200 });

  const danhSachBanDau: BaiDaTaoItem[] = danhSachContent.map((c) => ({
    id: c.id,
    beMat: (c.beMat as 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo') || 'fanpage',
    noiDung: c.noiDung ?? '',
    cauMoDau: c.cauMoDau ?? null,
    gocTiepCan: c.gocTiepCan ?? null,
    dangBai: (c.dangBai as 'chu' | 'anh_chu' | 'kich_ban_quay') || 'chu',
    trangThai: c.trangThai ?? 'san_sang',
    ngayTao: c.ngayTao ? c.ngayTao.toISOString() : new Date().toISOString(),
    moHinhDaSinh: c.moHinhDaSinh ?? null,
  }));

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">
            <Icon name="i-folder" size={13} />
            Kho nội dung
          </span>
          <h1 className="page-title">Bài đã tạo</h1>
          <p className="page-sub">
            Toàn bộ các bài viết và kịch bản video đã được biên soạn hoặc duyệt từ Studio (Sinh hàng loạt, Biên soạn, Chuỗi bài).
            Bấm nút &ldquo;Sao chép&rdquo; để lấy nội dung đăng lên Facebook / TikTok.
          </p>
        </div>
        <div className="page-head__nut">
          <a className="btn btn--primary btn--sm" href="/studio/hang-loat">
            <Icon name="i-copy" size={16} />
            Sinh 10 bài mới
          </a>
        </div>
      </div>

      <BangBaiDaTao danhSachBanDau={danhSachBanDau} />
    </>
  );
}
