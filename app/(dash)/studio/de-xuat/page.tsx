import type { Metadata } from 'next';
import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { kiemTraDeXuat } from '@/lib/brand/do-day-du';
import { Icon } from '../../../sprite-icon';
import { BangDeXuat } from './bang-de-xuat';
import type { YTuongDeXuat } from '@/lib/studio/kieu';
import '../../brand/brand.css';
import '../studio.css';

export const metadata: Metadata = {
  title: 'Đề xuất ý tưởng hôm nay — AI Content Studio',
};

export default async function TrangDeXuat() {
  const repo = createRepo(await workspaceHienTai());

  const [hoSo, truCot, chanDung, sanPham, insight, yTuongList] = await Promise.all([
    repo.hoSo.lay(),
    repo.truCot.list(),
    repo.chanDung.list(),
    repo.sanPham.list(),
    repo.insight.list(),
    repo.yTuong.list(100),
  ]);

  const doDayDu = kiemTraDeXuat({ truCot, chanDung, sanPham, insight, hoSo });

  const danhSachTruCot = truCot.map((t: { ten: string; tiLeMucTieu?: number | null }) => ({
    ten: t.ten,
    tiLeMucTieu: t.tiLeMucTieu ?? null,
  }));

  // Map danh sach y tuong da luu tu database sang YTuongDeXuat hop le
  const yTuongDaLuuBanDau: YTuongDeXuat[] = yTuongList.map((y: {
    id: string;
    beMat: string;
    gocTiepCan?: string | null;
    cauMoDau?: string | null;
    lyDoDeXuat?: string | null;
    pillarId?: string | null;
    personaId?: string | null;
    trendSignalId?: string | null;
    daDung?: boolean | null;
  }) => {
    const tc = truCot.find((t: { id: string }) => t.id === y.pillarId);
    const cd = chanDung.find((c: { id: string }) => c.id === y.personaId);
    return {
      ideaId: y.id,
      tieuDe: y.cauMoDau ? `${y.gocTiepCan || 'Ý tưởng'} — ${y.cauMoDau}` : (y.gocTiepCan || 'Ý tưởng nội dung'),
      truCot: (tc as { ten?: string } | undefined)?.ten ?? null,
      chanDung: (cd as { ten?: string } | undefined)?.ten ?? null,
      gocTiepCan: y.gocTiepCan ?? null,
      cauMoDau: y.cauMoDau ?? null,
      lyDoDeXuat: y.lyDoDeXuat ?? null,
      beMat: (y.beMat as 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo') || 'fanpage',
      trendSignalId: y.trendSignalId ?? null,
      daDung: y.daDung ?? false,
      khamPha: !y.pillarId,
    };
  });

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">
            <Icon name="i-sparkle" size={13} />
            Studio sáng tạo
          </span>
          <h1 className="page-title">Đề xuất ý tưởng hôm nay</h1>
          <p className="page-sub">
            Gợi ý ý tưởng bài đăng từ 4 nguồn dữ liệu: Insight &amp; chân dung khách hàng, trụ cột nội dung thương hiệu,
            lịch sử bài đã đăng và xu hướng từ kênh theo dõi.
          </p>
        </div>
      </div>

      <BangDeXuat
        doDayDuBanDau={{
          phanTram: doDayDu.phanTram,
          duocPhep: doDayDu.duocPhep,
          lyDo: doDayDu.lyDo,
        }}
        danhSachTruCot={danhSachTruCot}
        yTuongDaLuuBanDau={yTuongDaLuuBanDau}
      />
    </>
  );
}
