import type { Metadata } from 'next';
import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { Icon } from '../../../sprite-icon';
import { TrinhBienSoan } from './trinh-bien-soan';
import type { BeMat } from '@/lib/studio/kieu';
import '../../brand/brand.css';
import '../studio.css';

export const metadata: Metadata = {
  title: 'Biên soạn nội dung — AI Content Studio',
};

type Props = {
  searchParams: Promise<{
    title?: string;
    pillar?: string;
    persona?: string;
    angle?: string;
    hook?: string;
    beMat?: string;
  }>;
};

export default async function TrangBienSoan({ searchParams }: Props) {
  const repo = createRepo(await workspaceHienTai());
  const params = await searchParams;

  const [sanPhamList, truCotList, chanDungList, yTuongList] = await Promise.all([
    repo.sanPham.list(),
    repo.truCot.list(),
    repo.chanDung.list(),
    repo.yTuong.list(50),
  ]);

  const beMatParam: BeMat =
    params.beMat && ['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo'].includes(params.beMat)
      ? (params.beMat as BeMat)
      : 'fanpage';

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">
            <Icon name="i-text" size={13} />
            Biên tập &amp; Sản xuất
          </span>
          <h1 className="page-title">Biên soạn nội dung bài đăng</h1>
          <p className="page-sub">
            Từ 1 ý tưởng hoặc chủ đề &rarr; sinh bài viết hoàn chỉnh cho từng bề mặt, kiểm tra độ dài thời gian thực,
            quét vi phạm quy tắc thương hiệu và xuất kịch bản quay video ngắn.
          </p>
        </div>
      </div>

      <TrinhBienSoan
        sanPhamList={sanPhamList.map((s: { id: string; ten: string; gia: string | null; loiIch: string | null }) => ({ id: s.id, ten: s.ten, gia: s.gia, loiIch: s.loiIch }))}
        truCotList={truCotList.map((t: { id: string; ten: string }) => ({ id: t.id, ten: t.ten }))}
        chanDungList={chanDungList.map((c: { id: string; ten: string }) => ({ id: c.id, ten: c.ten }))}
        yTuongList={yTuongList.map((y: { id: string; gocTiepCan?: string | null; cauMoDau?: string | null; beMat?: string | null }) => ({ id: y.id, tieuDe: y.cauMoDau ? `${y.gocTiepCan || 'Ý tưởng'} - ${y.cauMoDau}` : (y.gocTiepCan ?? ''), gocTiepCan: y.gocTiepCan, cauMoDau: y.cauMoDau, beMat: y.beMat }))}
        giaTriKhoiTao={{
          tieuDe: params.title || '',
          truCot: params.pillar || '',
          chanDung: params.persona || '',
          gocTiepCan: params.angle || '',
          cauMoDau: params.hook || '',
          beMat: beMatParam,
        }}
      />
    </>
  );
}
