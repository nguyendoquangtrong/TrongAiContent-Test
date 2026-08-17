'use client';

import { useState, useTransition } from 'react';
import { Icon } from '../../../sprite-icon';
import type { KichBanVideo } from '@/lib/studio/kieu';
import { sinhKichBanAction } from './actions';

type Props = {
  sanPhamList: { id: string; ten: string; gia: string | null }[];
  giaTriKhoiTao: {
    tieuDe: string;
    gocTiepCan: string;
    cauMoDau: string;
  };
};

export function TrinhKichBan({ sanPhamList, giaTriKhoiTao }: Props) {
  const [tieuDe, setTieuDe] = useState(giaTriKhoiTao.tieuDe || '');
  const [gocTiepCan, setGocTiepCan] = useState(giaTriKhoiTao.gocTiepCan || '');
  const [cauMoDau, setCauMoDau] = useState(giaTriKhoiTao.cauMoDau || '');
  const [sanPhamId, setSanPhamId] = useState(sanPhamList[0]?.id || '');
  const [kichBan, setKichBan] = useState<KichBanVideo | null>(null);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSinh() {
    if (!tieuDe.trim()) {
      setThongBaoLoi('Vui lòng nhập chủ đề video.');
      return;
    }
    setThongBaoLoi(null);

    startTransition(async () => {
      try {
        const res = await sinhKichBanAction({
          beMat: 'tiktok',
          yTuong: {
            tieuDe,
            gocTiepCan: gocTiepCan || null,
            cauMoDau: cauMoDau || null,
          },
          sanPhamId: sanPhamId || null,
        });

        if (res.thanhCong && res.duLieu) {
          setKichBan(res.duLieu);
        } else {
          setThongBaoLoi(res.loi ?? 'Không thể sinh kịch bản video.');
        }
      } catch (err) {
        setThongBaoLoi((err as Error).message);
      }
    });
  }

  function handleSaoChep() {
    if (!kichBan) return;
    const lines = [
      `KỊCH BẢN VIDEO: ${kichBan.tieuDe}`,
      `Thời lượng: ${kichBan.tongThoiLuongGiay ?? 0}s\n`,
      ...kichBan.phanCanh.map((pc, idx) => `[Cảnh ${idx + 1} - ${pc.thoiLuongGiay}s]\n- Hình ảnh: ${pc.hinhAnh}\n- Lời thoại: "${pc.loiThoai}"\n`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  }

  return (
    <div className="hai-cot">
      <div className="panel">
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="i-film" size={18} /> Cấu hình kịch bản video
        </h2>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
            Chủ đề / Tiêu đề video <span style={{ color: 'var(--clay)' }}>*</span>
          </label>
          <input
            type="text"
            className="input"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
            placeholder="VD: 3 sai lầm khiến video TikTok không ai xem"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
            Sản phẩm / Dịch vụ lồng ghép
          </label>
          <select
            className="select"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
            value={sanPhamId}
            onChange={(e) => setSanPhamId(e.target.value)}
          >
            <option value="">-- Không chọn sản phẩm --</option>
            {sanPhamList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.ten} {s.gia ? `(${s.gia})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
            Góc tiếp cận
          </label>
          <input
            type="text"
            className="input"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
            placeholder="VD: Cảnh báo, So sánh trước/sau, Hướng dẫn..."
            value={gocTiepCan}
            onChange={(e) => setGocTiepCan(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
            Hook mở đầu (1-3s)
          </label>
          <input
            type="text"
            className="input"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
            placeholder="VD: Dừng lại 3 giây nếu bạn đang kinh doanh online..."
            value={cauMoDau}
            onChange={(e) => setCauMoDau(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn btn--primary"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={isPending || !tieuDe.trim()}
          onClick={handleSinh}
        >
          <Icon name="i-sparkle" size={16} />
          {isPending ? 'Đang viết kịch bản phân cảnh...' : 'Viết kịch bản video'}
        </button>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="i-layers" size={18} /> Phân cảnh chi tiết
          </h2>
          {kichBan && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="chip-note">⏱️ Tổng {kichBan.tongThoiLuongGiay ?? 0} giây</span>
              <button type="button" className="btn btn--secondary btn--sm" onClick={handleSaoChep}>
                <Icon name="i-copy" size={14} /> Sao chép
              </button>
            </div>
          )}
        </div>

        {thongBaoLoi && (
          <div style={{ padding: '8px 12px', background: 'var(--clay-50)', color: 'var(--clay)', borderRadius: 'var(--r-sm)', fontSize: 13, marginBottom: 14 }}>
            <Icon name="i-alert" size={14} /> {thongBaoLoi}
          </div>
        )}

        {kichBan && kichBan.phanCanh.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {kichBan.phanCanh.map((pc, idx) => (
              <div
                key={idx}
                style={{
                  padding: 14,
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--surface-2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--sage)', fontSize: 14 }}>
                    🎬 Cảnh {idx + 1}
                  </span>
                  <span className="chip-note" style={{ fontSize: 11, padding: '2px 8px' }}>
                    {pc.thoiLuongGiay} giây
                  </span>
                </div>

                <div style={{ marginBottom: 6, fontSize: 13 }}>
                  <strong style={{ color: 'var(--ink)' }}>📹 Quay &amp; Hành động: </strong>
                  <span style={{ color: 'var(--ink)' }}>{pc.hinhAnh}</span>
                </div>

                <div style={{ fontSize: 13 }}>
                  <strong style={{ color: 'var(--ink)' }}>🎙️ Lời thoại / Voiceover: </strong>
                  <span style={{ fontStyle: 'italic', color: 'var(--ink-2)' }}>&ldquo;{pc.loiThoai}&rdquo;</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-2)' }}>
            <Icon name="i-film" size={36} />
            <p style={{ marginTop: 12, fontSize: 14 }}>
              Nhập chủ đề video và bấm &ldquo;Viết kịch bản video&rdquo; để nhận kịch bản quay phân cảnh hoàn chỉnh cho Reels / TikTok Shorts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
