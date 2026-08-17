import type { Metadata } from 'next';
import { workspaceHienTai } from '@/lib/auth/current-workspace';
import { createRepo } from '@/lib/data-access';
import { kiemTraDeXuat } from '@/lib/brand/do-day-du';
import { Icon } from '../../../sprite-icon';
import { TrinhHangLoat } from './trinh-hang-loat';
import '../../brand/brand.css';
import '../studio.css';

export const metadata: Metadata = {
  title: 'Sinh hàng loạt 10 bài/ngày — AI Content Studio',
};

export default async function TrangHangLoat() {
  const repo = createRepo(await workspaceHienTai());

  const [hoSo, truCot, chanDung, sanPham, insight] = await Promise.all([
    repo.hoSo.lay(),
    repo.truCot.list(),
    repo.chanDung.list(),
    repo.sanPham.list(),
    repo.insight.list(),
  ]);

  const doDayDu = kiemTraDeXuat({ truCot, chanDung, sanPham, insight, hoSo });

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <span className="eyebrow">
            <Icon name="i-copy" size={13} />
            Sản xuất quy mô
          </span>
          <h1 className="page-title">Sinh hàng loạt 10 bài Facebook / ngày</h1>
          <p className="page-sub">
            Sản xuất nội dung trọn gói cho cả ngày: tự động rải trụ cột, đa dạng hóa định dạng (Feed, Story, Reels)
            theo 10 khung giờ vàng, giúp duyệt và lên lịch chỉ trong vài phút.
          </p>
        </div>
      </div>

      <TrinhHangLoat
        doDayDuBanDau={{
          phanTram: doDayDu.phanTram,
          duocPhep: doDayDu.duocPhep,
          lyDo: doDayDu.lyDo,
        }}
      />
    </>
  );
}
