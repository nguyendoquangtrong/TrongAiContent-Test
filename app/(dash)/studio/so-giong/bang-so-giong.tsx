'use client';

import { useState, useTransition } from 'react';
import { Icon } from '../../../sprite-icon';
import type { KetQuaSoGiong } from '@/lib/studio/so-giong';
import { soGiongAction } from './actions';

type Props = {
  sanPhamList: { id: string; ten: string; gia: string | null }[];
  truCotList: { id: string; ten: string }[];
  chanDungList: { id: string; ten: string }[];
};

export function BangSoGiong({ sanPhamList, truCotList, chanDungList }: Props) {
  const [tieuDe, setTieuDe] = useState('');
  const [sanPhamId, setSanPhamId] = useState(sanPhamList[0]?.id || '');
  const [truCot, setTruCot] = useState('');
  const [chanDung, setChanDung] = useState('');

  const [ketQua, setKetQua] = useState<KetQuaSoGiong | null>(null);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSoGiong() {
    if (!tieuDe.trim()) {
      setThongBaoLoi('Vui lòng nhập chủ đề cần so sánh.');
      return;
    }
    setThongBaoLoi(null);

    startTransition(async () => {
      try {
        const res = await soGiongAction({
          yTuong: {
            tieuDe,
            truCot: truCot || null,
            chanDung: chanDung || null,
          },
          sanPhamId: sanPhamId || null,
        });

        if (res.thanhCong && res.duLieu) {
          setKetQua(res.duLieu);
        } else {
          setThongBaoLoi(res.loi ?? 'Không thể so sánh giọng điệu.');
        }
      } catch (err) {
        setThongBaoLoi((err as Error).message);
      }
    });
  }

  const beMatConfig = [
    { key: 'fanpage' as const, ten: 'Fanpage Facebook', icon: 'i-layers', chuanDoDai: '150–300 từ', vaiTro: 'Giải thích sâu, nuôi dưỡng niềm tin & chuyển đổi' },
    { key: 'ho_so_ca_nhan' as const, ten: 'Trang cá nhân', icon: 'i-person', chuanDoDai: '120–250 từ', vaiTro: 'Kể trải nghiệm người thật xưng "mình/tôi"' },
    { key: 'tiktok' as const, ten: 'TikTok Video', icon: 'i-film', chuanDoDai: '60–120 từ', vaiTro: 'Hook 1-2s, câu ngắn, nói được thành tiếng' },
    { key: 'zalo' as const, ten: 'Zalo cá nhân', icon: 'i-text', chuanDoDai: '40–100 từ', vaiTro: 'Tin nhắn thân mật, kết bằng câu hỏi mở' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Panel cau hinh */}
      <div className="panel">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
              Chủ đề hoặc thông điệp cốt lõi <span style={{ color: 'var(--clay)' }}>*</span>
            </label>
            <input
              type="text"
              className="input"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              placeholder="VD: Bí quyết làm video marketing đều tay mà không kiệt sức"
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
            />
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
              Sản phẩm lồng ghép
            </label>
            <select
              className="select"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              value={sanPhamId}
              onChange={(e) => setSanPhamId(e.target.value)}
            >
              <option value="">-- Không chọn --</option>
              {sanPhamList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ten}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 180px' }}>
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
            <button
              type="button"
              className="btn btn--primary"
              disabled={isPending || !tieuDe.trim()}
              onClick={handleSoGiong}
              style={{ minWidth: 160 }}
            >
              <Icon name="i-sparkle" size={16} />
              {isPending ? 'Đang so sánh...' : 'So 4 giọng cạnh nhau'}
            </button>
          </div>
        </div>
      </div>

      {thongBaoLoi && (
        <div className="panel" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', fontSize: 14 }}>
          <Icon name="i-alert" size={16} /> {thongBaoLoi}
        </div>
      )}

      {/* 2. Bon cot so sanh */}
      {ketQua ? (
        <div className="bon-cot">
          {beMatConfig.map((cfg) => {
            const bai = ketQua[cfg.key];
            return (
              <div key={cfg.key} className="cot-be-mat">
                <div className="cot-be-mat__dau">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="cot-be-mat__ten" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name={cfg.icon} size={16} /> {cfg.ten}
                    </span>
                    {bai && (
                      <span className="chip-note" style={{ fontSize: 11, padding: '1px 6px' }}>
                        {bai.soTu} từ
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>
                    {cfg.vaiTro} (Chuẩn: {cfg.chuanDoDai})
                  </div>
                </div>

                {bai ? (
                  <>
                    <h4 className="cot-be-mat__tieu-de" style={{ margin: '6px 0 4px' }}>
                      {bai.tieuDe}
                    </h4>
                    <div className="cot-be-mat__than">
                      {bai.noiDung}
                    </div>
                    {bai.hashtag.length > 0 && (
                      <div className="cot-be-mat__the">
                        {bai.hashtag.join(' ')}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: 'var(--ink-2)', fontSize: 13, fontStyle: 'italic', padding: '20px 0', textAlign: 'center' }}>
                    Chưa sinh nội dung
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-2)' }}>
          <Icon name="i-eye" size={36} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', margin: '12px 0 6px' }}>
            Xem và đối chiếu 4 phong cách giọng điệu
          </h3>
          <p style={{ fontSize: 14, maxWidth: 520, margin: '0 auto' }}>
            Nhập chủ đề và bấm &ldquo;So 4 giọng cạnh nhau&rdquo; để thấy rõ cùng một thông điệp sẽ được diễn đạt khác biệt thế nào giữa Fanpage, Trang cá nhân, TikTok và Zalo.
          </p>
        </div>
      )}
    </div>
  );
}
