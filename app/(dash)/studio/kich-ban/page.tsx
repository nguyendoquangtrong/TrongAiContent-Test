import type { Metadata } from 'next';
import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { Icon } from '../../../sprite-icon';
import { TrinhKichBan } from './trinh-kich-ban';
import '../../brand/brand.css';
import '../studio.css';

export const metadata: Metadata = {
  title: 'Kịch bản quay video — AI Content Studio',
};

type Props = {
  searchParams: Promise<{
    title?: string;
    angle?: string;
    hook?: string;
  }>;
};

export default async function TrangKichBan({ searchParams }: Props) {
  const repo = createRepo(await workspaceHienTai());
  const params = await searchParams;
  const sanPhamList = await repo.sanPham.list();

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">
            <Icon name="i-film" size={13} />
            Video Studio
          </span>
          <h1 className="page-title">Kịch bản quay video phân cảnh</h1>
          <p className="page-sub">
            Chuyển hóa ý tưởng thành kịch bản phân cảnh ngắn (15–60 giây) cho Reels và TikTok:
            hướng dẫn góc máy, hành động demo sản phẩm và lời thoại tự nhiên từng giây.
          </p>
        </div>
      </div>

      <TrinhKichBan
        sanPhamList={sanPhamList.map((s: { id: string; ten: string; gia: string | null }) => ({ id: s.id, ten: s.ten, gia: s.gia }))}
        giaTriKhoiTao={{
          tieuDe: params.title || '',
          gocTiepCan: params.angle || '',
          cauMoDau: params.hook || '',
        }}
      />
    </>
  );
}
