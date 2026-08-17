import type { Metadata } from 'next';
import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { Icon } from '../../../sprite-icon';
import { TrinhChuoiBai } from './trinh-chuoi-bai';
import '../../brand/brand.css';
import '../studio.css';

export const metadata: Metadata = {
  title: 'Chuỗi bài nối mạch — AI Content Studio',
};

export default async function TrangChuoiBai() {
  const repo = createRepo(await workspaceHienTai());
  const [truCotList, chanDungList] = await Promise.all([
    repo.truCot.list(),
    repo.chanDung.list(),
  ]);

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">
            <Icon name="i-layers" size={13} />
            Mạch nội dung liên kết
          </span>
          <h1 className="page-title">Chuỗi bài nối mạch không lặp ý</h1>
          <p className="page-sub">
            Sản xuất chuỗi 3–5 bài viết chuyên sâu cùng một chủ đề: bài sau kế thừa và mở rộng luận điểm của bài trước,
            giúp dẫn dắt khách hàng qua từng giai đoạn nhận thức.
          </p>
        </div>
      </div>

      <TrinhChuoiBai
        truCotList={truCotList.map((t: { id: string; ten: string }) => ({ id: t.id, ten: t.ten }))}
        chanDungList={chanDungList.map((c: { id: string; ten: string }) => ({ id: c.id, ten: c.ten }))}
      />
    </>
  );
}
