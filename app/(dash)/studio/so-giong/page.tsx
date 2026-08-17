import type { Metadata } from 'next';
import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { Icon } from '../../../sprite-icon';
import { BangSoGiong } from './bang-so-giong';
import '../../brand/brand.css';
import '../studio.css';

export const metadata: Metadata = {
  title: 'So 4 giọng — AI Content Studio',
};

export default async function TrangSoGiong() {
  const repo = createRepo(await workspaceHienTai());

  const [sanPhamList, truCotList, chanDungList] = await Promise.all([
    repo.sanPham.list(),
    repo.truCot.list(),
    repo.chanDung.list(),
  ]);

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">
            <Icon name="i-eye" size={13} />
            Đối chiếu phong cách
          </span>
          <h1 className="page-title">So 4 giọng của 4 bề mặt cạnh nhau</h1>
          <p className="page-sub">
            Cùng một thông điệp nhưng khác biệt hoàn toàn về độ dài, nhịp câu và cách dẫn dắt trên Fanpage,
            Trang cá nhân, TikTok và Zalo.
          </p>
        </div>
      </div>

      <BangSoGiong
        sanPhamList={sanPhamList.map((s: { id: string; ten: string; gia: string | null }) => ({ id: s.id, ten: s.ten, gia: s.gia }))}
        truCotList={truCotList.map((t: { id: string; ten: string }) => ({ id: t.id, ten: t.ten }))}
        chanDungList={chanDungList.map((c: { id: string; ten: string }) => ({ id: c.id, ten: c.ten }))}
      />
    </>
  );
}
