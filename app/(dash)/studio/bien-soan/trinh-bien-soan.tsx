'use client';

import { useState, useTransition } from 'react';
import { Icon } from '../../../sprite-icon';
import { quetQuyTacNgonNgu, type ViPhamNgonNgu } from '@/lib/brand/quy-tac-ngon-ngu';
import { demTu, kiemTraDoDai } from '@/lib/studio/cong-dem-tu';
import type { BaiVietBienSoan, BeMat, GoiYVisual, KichBanVideo } from '@/lib/studio/kieu';
import { luuBaiVietAction, sinhBaiVietAction, sinhKichBanTuBaiAction, sinhVisualAction } from './actions';

type Props = {
  sanPhamList: { id: string; ten: string; gia: string | null; loiIch: string | null }[];
  truCotList: { id: string; ten: string }[];
  chanDungList: { id: string; ten: string }[];
  yTuongList: { id: string; tieuDe?: string | null; gocTiepCan?: string | null; cauMoDau?: string | null; beMat?: string | null }[];
  giaTriKhoiTao: {
    tieuDe: string;
    truCot: string;
    chanDung: string;
    gocTiepCan: string;
    cauMoDau: string;
    beMat: BeMat;
  };
};

export function TrinhBienSoan({
  sanPhamList,
  truCotList,
  chanDungList,
  yTuongList,
  giaTriKhoiTao,
}: Props) {
  // Input form state
  const [tieuDe, setTieuDe] = useState(giaTriKhoiTao.tieuDe || '');
  const [truCot, setTruCot] = useState(giaTriKhoiTao.truCot || '');
  const [chanDung, setChanDung] = useState(giaTriKhoiTao.chanDung || '');
  const [gocTiepCan, setGocTiepCan] = useState(giaTriKhoiTao.gocTiepCan || '');
  const [cauMoDau, setCauMoDau] = useState(giaTriKhoiTao.cauMoDau || '');
  const [beMat, setBeMat] = useState<BeMat>(giaTriKhoiTao.beMat || 'fanpage');
  const [sanPhamId, setSanPhamId] = useState<string>(sanPhamList[0]?.id || '');

  // Output editor state
  const [noiDung, setNoiDung] = useState<string>('');
  const [hashtagText, setHashtagText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'bai-viet' | 'kich-ban' | 'visual'>('bai-viet');

  // Video script state
  const [kichBan, setKichBan] = useState<KichBanVideo | null>(null);
  const [isPendingKichBan, startTransitionKichBan] = useTransition();

  // Visual concept state
  const [visual, setVisual] = useState<GoiYVisual | null>(null);
  const [isPendingVisual, startTransitionVisual] = useTransition();

  // Status state
  const [isPendingSinh, startTransitionSinh] = useTransition();
  const [isPendingLuu, startTransitionLuu] = useTransition();
  const [thongBaoLuu, setThongBaoLuu] = useState<string | null>(null);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);
  const [trungGoc, setTrungGoc] = useState<{ id: string; cau_mo_dau: string | null; goc_tiep_can: string | null; do_giong: number }[]>([]);

  // Realtime checks
  const doDai = kiemTraDoDai(noiDung, beMat);
  const viPham: ViPhamNgonNgu[] = quetQuyTacNgonNgu(noiDung);

  function handleChonYTuong(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const item = yTuongList.find((y) => y.id === selectedId);
    if (item) {
      if (item.tieuDe) setTieuDe(item.tieuDe);
      if (item.gocTiepCan) setGocTiepCan(item.gocTiepCan);
      if (item.cauMoDau) setCauMoDau(item.cauMoDau);
      if (item.beMat && ['fanpage', 'ho_so_ca_nhan', 'tiktok', 'zalo'].includes(item.beMat)) {
        setBeMat(item.beMat as BeMat);
      }
    }
  }

  function handleSinhBaiViet() {
    if (!tieuDe.trim()) {
      setThongBaoLoi('Vui lòng nhập tiêu đề hoặc chọn một ý tưởng.');
      return;
    }
    setThongBaoLoi(null);
    setThongBaoLuu(null);

    startTransitionSinh(async () => {
      try {
        const res = await sinhBaiVietAction({
          beMat,
          yTuong: {
            tieuDe,
            truCot: truCot || null,
            chanDung: chanDung || null,
            gocTiepCan: gocTiepCan || null,
            cauMoDau: cauMoDau || null,
          },
          sanPhamId: sanPhamId || null,
        });

        if (res.thanhCong && res.duLieu) {
          setNoiDung(res.duLieu.noiDung);
          setHashtagText(res.duLieu.hashtag.join(' '));
          if (res.duLieu.trungGoc) setTrungGoc(res.duLieu.trungGoc);
          setActiveTab('bai-viet');
        } else {
          setThongBaoLoi(res.loi ?? 'Không thể sinh nội dung bài viết.');
        }
      } catch (err) {
        setThongBaoLoi((err as Error).message || 'Lỗi khi gọi máy sinh nội dung.');
      }
    });
  }

  function handleSinhKichBan() {
    if (!tieuDe.trim()) return;
    startTransitionKichBan(async () => {
      try {
        const res = await sinhKichBanTuBaiAction(tieuDe, noiDung, sanPhamId, beMat);
        if (res.thanhCong && res.duLieu) {
          setKichBan(res.duLieu);
          setActiveTab('kich-ban');
        }
      } catch (err) {
        setThongBaoLoi((err as Error).message);
      }
    });
  }

  function handleSinhVisual() {
    if (!tieuDe.trim()) return;
    startTransitionVisual(async () => {
      try {
        const res = await sinhVisualAction(tieuDe, noiDung, sanPhamId);
        if (res.thanhCong && res.duLieu) {
          setVisual(res.duLieu);
          setActiveTab('visual');
        }
      } catch (err) {
        setThongBaoLoi((err as Error).message);
      }
    });
  }

  function handleLuuBai(trangThai: 'ban_nhap' | 'san_sang') {
    if (!noiDung.trim()) return;
    setThongBaoLoi(null);

    startTransitionLuu(async () => {
      try {
        const hashtags = hashtagText.split(/\s+/).filter((h) => h.startsWith('#') || h.length > 0);
        const baiViet: BaiVietBienSoan = {
          tieuDe,
          noiDung,
          hashtag: hashtags,
          cauMoDau: cauMoDau || null,
          beMat,
          gocTiepCan: gocTiepCan || null,
          productId: sanPhamId || null,
        };

        const res = await luuBaiVietAction(baiViet, trangThai);
        if (res) {
          setThongBaoLuu(trangThai === 'san_sang' ? 'Đã lưu vào danh sách Sẵn sàng đăng!' : 'Đã lưu vào Bản nháp thành công!');
        }
      } catch (err) {
        setThongBaoLoi((err as Error).message || 'Không thể lưu bài viết.');
      }
    });
  }

  return (
    <div className="hai-cot">
      {/* COT TRAI: Form cau hinh y tuong & dau vao */}
      <div className="panel">
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="i-sparkle" size={18} /> Cấu hình đầu vào
        </h2>

        {yTuongList.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
              Chọn từ ý tưởng đã lưu:
            </label>
            <select
              className="select"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              onChange={handleChonYTuong}
            >
              <option value="">-- Chọn ý tưởng gợi ý --</option>
              {yTuongList.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.tieuDe || y.gocTiepCan || 'Ý tưởng không tên'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
            Tiêu đề / Chủ đề bài viết <span style={{ color: 'var(--clay)' }}>*</span>
          </label>
          <input
            type="text"
            className="input"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
            placeholder="VD: 3 mẹo tiết kiệm thời gian làm video cho chủ shop"
            value={tieuDe}
            onChange={(e) => setTieuDe(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
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
              <option value="tiktok">TikTok Video</option>
              <option value="zalo">Zalo cá nhân</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
              Sản phẩm / Dịch vụ
            </label>
            <select
              className="select"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              value={sanPhamId}
              onChange={(e) => setSanPhamId(e.target.value)}
            >
              <option value="">-- Chọn sản phẩm --</option>
              {sanPhamList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ten} {s.gia ? `(${s.gia})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
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
              <option value="">-- Chọn trụ cột --</option>
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
              <option value="">-- Chọn chân dung --</option>
              {chanDungList.map((c) => (
                <option key={c.id} value={c.ten}>
                  {c.ten}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
            Góc tiếp cận (Angle)
          </label>
          <input
            type="text"
            className="input"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
            placeholder="VD: Góc nhìn người trong cuộc, so sánh trước/sau..."
            value={gocTiepCan}
            onChange={(e) => setGocTiepCan(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
            Câu mở đầu gợi ý (Hook)
          </label>
          <input
            type="text"
            className="input"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
            placeholder="VD: Đừng vội thuê editor nếu bạn chưa thử cách này..."
            value={cauMoDau}
            onChange={(e) => setCauMoDau(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn btn--primary"
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={isPendingSinh || !tieuDe.trim()}
          onClick={handleSinhBaiViet}
        >
          <Icon name="i-sparkle" size={16} />
          {isPendingSinh ? 'Đang viết bài...' : 'Sinh nội dung bài đăng'}
        </button>

        {/* Canh bao trung goc tiep can */}
        {trungGoc.length > 0 && (
          <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', fontSize: 13 }}>
            <div style={{ fontWeight: 600, color: 'var(--clay)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="i-alert" size={14} /> Có {trungGoc.length} bài gần đây có góc tiếp cận tương tự:
            </div>
            {trungGoc.map((tg) => (
              <div key={tg.id} style={{ color: 'var(--ink-2)', marginTop: 2 }}>
                · {tg.goc_tiep_can || tg.cau_mo_dau} ({Math.round(tg.do_giong * 100)}% giống)
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COT PHAI: Trinh soan thao & Kiem tra chat luong */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Navigation Tabs */}
        <div className="studio-tabs">
          <button
            type="button"
            className="studio-tab"
            data-active={activeTab === 'bai-viet'}
            onClick={() => setActiveTab('bai-viet')}
          >
            <Icon name="i-text" size={15} /> Bài viết {beMat === 'fanpage' ? 'Fanpage' : beMat === 'ho_so_ca_nhan' ? 'Trang cá nhân' : beMat === 'tiktok' ? 'TikTok' : 'Zalo'}
          </button>
          <button
            type="button"
            className="studio-tab"
            data-active={activeTab === 'kich-ban'}
            onClick={() => {
              setActiveTab('kich-ban');
              if (!kichBan && noiDung) handleSinhKichBan();
            }}
          >
            <Icon name="i-film" size={15} /> Kịch bản quay video
          </button>
          <button
            type="button"
            className="studio-tab"
            data-active={activeTab === 'visual'}
            onClick={() => {
              setActiveTab('visual');
              if (!visual && noiDung) handleSinhVisual();
            }}
          >
            <Icon name="i-image" size={15} /> Gợi ý ảnh Visual
          </button>
        </div>

        {thongBaoLoi && (
          <div style={{ padding: '10px 14px', background: 'var(--clay-bg)', color: 'var(--clay)', borderRadius: 'var(--r-sm)', fontSize: 13, border: '1px solid var(--clay)', fontWeight: 600 }}>
            <Icon name="i-alert" size={15} /> {thongBaoLoi}
          </div>
        )}

        {thongBaoLuu && (
          <div style={{ padding: '10px 14px', background: 'var(--sage-bg)', color: 'var(--sage)', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, border: '1px solid var(--sage)' }}>
            <Icon name="i-check" size={15} /> {thongBaoLuu}
          </div>
        )}

        {/* TAB 1: SOAN THAO BAI VIET */}
        {activeTab === 'bai-viet' && (
          <div className="soan">
            <textarea
              className="textarea soan__o"
              style={{
                width: '100%',
                minHeight: 260,
                padding: '12px 14px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--line-strong)',
                background: '#1e1915',
                color: '#ffffff',
                fontFamily: 'inherit',
                fontSize: 14,
                lineHeight: 1.6,
              }}
              placeholder="Nội dung bài viết sẽ xuất hiện ở đây sau khi sinh..."
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
            />

            {/* Thanh do do dai thoi gian thuc */}
            <div className="soan__do">
              <span className={`soan__dem--${doDai.trangThai}`}>
                <strong>{doDai.soTu}</strong> từ
              </span>
              <span className="soan__lech">
                (Chuẩn {beMat}: {doDai.toiThieu}–{doDai.toiDa} từ · {doDai.thongBao})
              </span>
            </div>

            {/* Canh bao tu ngu vi pham */}
            {viPham.length > 0 && (
              <div style={{ padding: '12px 14px', background: 'var(--clay-bg)', border: '1px solid var(--clay)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--ink)' }}>
                <div style={{ fontWeight: 600, color: 'var(--clay)', marginBottom: 6 }}>
                  ⚠️ Phát hiện {viPham.length} cụm từ cần thay thế theo quy tắc thương hiệu:
                </div>
                {viPham.map((vp, idx) => (
                  <div key={idx} style={{ margin: '4px 0' }}>
                    · Cụm từ <strong>&ldquo;{vp.cumTu}&rdquo;</strong> &rarr; Thay bằng: <em>&ldquo;{vp.thayBang}&rdquo;</em>
                  </div>
                ))}
              </div>
            )}

            {/* Hashtag */}
            <div style={{ marginTop: 6 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
                Hashtags
              </label>
              <input
                type="text"
                className="input"
                style={{ width: '100%', padding: '6px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 13 }}
                placeholder="#kinhdoanh #contentmarketing #aivideo"
                value={hashtagText}
                onChange={(e) => setHashtagText(e.target.value)}
              />
            </div>

            {/* Buttons action */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
              <button
                type="button"
                className="btn btn--secondary"
                disabled={isPendingLuu || !noiDung.trim()}
                onClick={() => handleLuuBai('ban_nhap')}
              >
                <Icon name="i-file" size={15} /> Lưu nháp
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={isPendingLuu || !noiDung.trim()}
                onClick={() => handleLuuBai('san_sang')}
              >
                <Icon name="i-check" size={15} /> Sẵn sàng đăng
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: KICH BAN VIDEO */}
        {activeTab === 'kich-ban' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                Kịch bản phân cảnh video ngắn ({kichBan?.tongThoiLuongGiay ?? 0}s)
              </h3>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={isPendingKichBan}
                onClick={handleSinhKichBan}
              >
                <Icon name="i-sparkle" size={14} />
                {isPendingKichBan ? 'Đang viết kịch bản...' : 'Sinh lại kịch bản'}
              </button>
            </div>

            {kichBan && kichBan.phanCanh.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {kichBan.phanCanh.map((pc, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 12,
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--surface-2)',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ color: 'var(--ink)' }}>Cảnh {idx + 1}</strong>
                      <span className="chip-note" style={{ fontSize: 11, padding: '1px 6px' }}>{pc.thoiLuongGiay} giây</span>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>📹 Hình ảnh / Quay: </span>
                      <span>{pc.hinhAnh}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>🎙️ Lời thoại: </span>
                      <span style={{ fontStyle: 'italic', color: 'var(--ink)' }}>&ldquo;{pc.loiThoai}&rdquo;</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--ink-2)' }}>
                <p>Chưa có kịch bản quay. Bấm &ldquo;Sinh lại kịch bản&rdquo; để tạo kịch bản phân cảnh từ nội dung bài viết.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VISUAL CONCEPT */}
        {activeTab === 'visual' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Gợi ý Prompt &amp; Visual Concept</h3>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={isPendingVisual}
                onClick={handleSinhVisual}
              >
                <Icon name="i-sparkle" size={14} />
                {isPendingVisual ? 'Đang tạo prompt...' : 'Tạo prompt ảnh'}
              </button>
            </div>

            {visual ? (
              <div style={{ padding: 14, border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)' }}>
                <div style={{ marginBottom: 8, fontSize: 13 }}>
                  <strong>Phong cách:</strong> {visual.phongCach} (Tỷ lệ {visual.tyLe})
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
                    Prompt Midjourney / Flux / DALL-E:
                  </label>
                  <textarea
                    readOnly
                    className="textarea"
                    style={{ width: '100%', minHeight: 90, padding: 8, fontSize: 13, borderRadius: 'var(--r-sm)', border: '1px solid var(--line-strong)', background: '#1e1915', color: '#ffffff', fontFamily: 'monospace' }}
                    value={visual.promptAnh}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => navigator.clipboard.writeText(visual.promptAnh)}
                >
                  <Icon name="i-copy" size={14} /> Sao chép Prompt
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--ink-2)' }}>
                <p>Bấm &ldquo;Tạo prompt ảnh&rdquo; để nhận visual concept và prompt chụp ảnh sản phẩm / minh họa phù hợp với bài viết.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
