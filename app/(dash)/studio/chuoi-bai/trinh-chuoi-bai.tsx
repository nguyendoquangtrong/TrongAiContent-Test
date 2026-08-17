'use client';

import { useState, useTransition } from 'react';
import { Icon } from '../../../sprite-icon';
import type { BaiVietBienSoan, BeMat } from '@/lib/studio/kieu';
import { luuChuoiBaiAction, sinhChuoiBaiAction } from './actions';

type Props = {
  truCotList: { id: string; ten: string }[];
  chanDungList: { id: string; ten: string }[];
};

export function TrinhChuoiBai({ truCotList, chanDungList }: Props) {
  const [chuDeChinh, setChuDeChinh] = useState('');
  const [soLuongBai, setSoLuongBai] = useState(3);
  const [beMat, setBeMat] = useState<BeMat>('fanpage');
  const [truCot, setTruCot] = useState('');
  const [chanDung, setChanDung] = useState('');

  const [chuoiId, setChuoiId] = useState<string | null>(null);
  const [danhSachBai, setDanhSachBai] = useState<(BaiVietBienSoan & { thuTu: number })[]>([]);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);
  const [thongBaoLuu, setThongBaoLuu] = useState<string | null>(null);

  const [isPendingSinh, startTransitionSinh] = useTransition();
  const [isPendingLuu, startTransitionLuu] = useTransition();

  function handleSinh() {
    if (!chuDeChinh.trim()) {
      setThongBaoLoi('Vui lòng nhập chủ đề chính của chuỗi bài.');
      return;
    }
    setThongBaoLoi(null);
    setThongBaoLuu(null);

    startTransitionSinh(async () => {
      try {
        const res = await sinhChuoiBaiAction({
          chuDeChinh,
          soLuongBai,
          beMat,
          truCot: truCot || null,
          chanDung: chanDung || null,
        });

        if (res.thanhCong && res.duLieu) {
          setChuoiId(res.duLieu.chuoiId);
          setDanhSachBai(res.duLieu.danhSachBai);
        } else {
          setThongBaoLoi(res.loi ?? 'Không thể sinh chuỗi bài.');
        }
      } catch (err) {
        setThongBaoLoi((err as Error).message);
      }
    });
  }

  function handleLuu() {
    if (!chuoiId || danhSachBai.length === 0) return;
    setThongBaoLoi(null);

    startTransitionLuu(async () => {
      try {
        await luuChuoiBaiAction(chuoiId, danhSachBai);
        setThongBaoLuu(`Đã lưu toàn bộ chuỗi ${danhSachBai.length} bài vào Bản nháp!`);
      } catch (err) {
        setThongBaoLoi((err as Error).message);
      }
    });
  }

  return (
    <div className="hai-cot">
      <div className="panel">
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="i-layers" size={18} /> Cấu hình chuỗi bài nối tiếp
        </h2>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
            Chủ đề chuỗi bài <span style={{ color: 'var(--clay)' }}>*</span>
          </label>
          <input
            type="text"
            className="input"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
            placeholder="VD: Cẩm nang xây dựng kênh TikTok từ con số 0"
            value={chuDeChinh}
            onChange={(e) => setChuDeChinh(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
              Số lượng bài trong chuỗi
            </label>
            <select
              className="select"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              value={soLuongBai}
              onChange={(e) => setSoLuongBai(Number(e.target.value))}
            >
              <option value={3}>Chuỗi 3 bài (Ngắn gọn)</option>
              <option value={4}>Chuỗi 4 bài (Tiêu chuẩn)</option>
              <option value={5}>Chuỗi 5 bài (Chuyên sâu)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
              Bề mặt đăng
            </label>
            <select
              className="select"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              value={beMat}
              onChange={(e) => setBeMat(e.target.value as BeMat)}
            >
              <option value="fanpage">Fanpage Facebook</option>
              <option value="ho_so_ca_nhan">Trang cá nhân</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
              Trụ cột nội dung
            </label>
            <select
              className="select"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              value={truCot}
              onChange={(e) => setTruCot(e.target.value)}
            >
              <option value="">-- Tự động --</option>
              {truCotList.map((t) => (
                <option key={t.id} value={t.ten}>
                  {t.ten}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
              Chân dung khách hàng
            </label>
            <select
              className="select"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              value={chanDung}
              onChange={(e) => setChanDung(e.target.value)}
            >
              <option value="">-- Tự động --</option>
              {chanDungList.map((c) => (
                <option key={c.id} value={c.ten}>
                  {c.ten}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="btn btn--primary"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={isPendingSinh || !chuDeChinh.trim()}
          onClick={handleSinh}
        >
          <Icon name="i-sparkle" size={16} />
          {isPendingSinh ? 'Đang viết chuỗi bài nối tiếp...' : `Sinh chuỗi ${soLuongBai} bài nối mạch`}
        </button>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
            Mạch bài viết liên kết ({danhSachBai.length} bài)
          </h2>
          {danhSachBai.length > 0 && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={isPendingLuu}
              onClick={handleLuu}
            >
              <Icon name="i-check" size={14} /> Lưu toàn bộ chuỗi bài
            </button>
          )}
        </div>

        {thongBaoLoi && (
          <div style={{ padding: '10px 14px', background: 'var(--clay-bg)', color: 'var(--clay)', borderRadius: 'var(--r-sm)', fontSize: 13, marginBottom: 14, border: '1px solid var(--clay)', fontWeight: 600 }}>
            <Icon name="i-alert" size={15} /> {thongBaoLoi}
          </div>
        )}

        {thongBaoLuu && (
          <div style={{ padding: '10px 14px', background: 'var(--sage-bg)', color: 'var(--sage)', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, marginBottom: 14, border: '1px solid var(--sage)' }}>
            <Icon name="i-check" size={15} /> {thongBaoLuu}
          </div>
        )}

        {danhSachBai.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {danhSachBai.map((bai) => (
              <div key={bai.thuTu} className="muc--trong-chuoi" style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ color: 'var(--sage)' }}>Phần {bai.thuTu}</strong>
                  <span className="chip-note" style={{ fontSize: 11, padding: '2px 8px' }}>{bai.soTu} từ</span>
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>{bai.tieuDe}</h4>
                <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--ink)' }}>
                  {bai.noiDung}
                </div>
                {bai.hashtag.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-2)' }}>
                    {bai.hashtag.join(' ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-2)' }}>
            <Icon name="i-layers" size={36} />
            <p style={{ marginTop: 12, fontSize: 14 }}>
              Nhập chủ đề chuỗi và bấm &ldquo;Sinh chuỗi bài nối mạch&rdquo; để tự động tạo một mạch truyện liền mạch gồm 3–5 bài không lặp ý.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
