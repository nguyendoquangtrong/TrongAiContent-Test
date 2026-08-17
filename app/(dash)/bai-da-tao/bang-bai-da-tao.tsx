'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Icon } from '../../sprite-icon';
import { doiTrangThaiAction, xoaBaiAction } from './actions';

export type BaiDaTaoItem = {
  id: string;
  beMat: 'fanpage' | 'ho_so_ca_nhan' | 'tiktok' | 'zalo';
  noiDung: string;
  cauMoDau: string | null;
  gocTiepCan: string | null;
  dangBai: 'chu' | 'anh_chu' | 'kich_ban_quay';
  trangThai: string;
  ngayTao: string;
  moHinhDaSinh: string | null;
};

type Props = {
  danhSachBanDau: BaiDaTaoItem[];
};

export function BangBaiDaTao({ danhSachBanDau }: Props) {
  const [danhSach, setDanhSach] = useState<BaiDaTaoItem[]>(danhSachBanDau);
  const [locTrangThai, setLocTrangThai] = useState<string>('tat_ca');
  const [locBeMat, setLocBeMat] = useState<string>('tat_ca');
  const [daCopyId, setDaCopyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setDaCopyId(id);
    setTimeout(() => setDaCopyId(null), 2000);
  }

  function handleDoiTrangThai(id: string, trangThai: 'san_sang' | 'ban_nhap' | 'da_dang') {
    startTransition(async () => {
      const res = await doiTrangThaiAction(id, trangThai);
      if (res.thanhCong) {
        setDanhSach((prev) =>
          prev.map((b) => (b.id === id ? { ...b, trangThai } : b)),
        );
      }
    });
  }

  function handleXoa(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    startTransition(async () => {
      const res = await xoaBaiAction(id);
      if (res.thanhCong) {
        setDanhSach((prev) => prev.filter((b) => b.id !== id));
      }
    });
  }

  const danhSachLoc = danhSach.filter((b) => {
    if (locTrangThai !== 'tat_ca' && b.trangThai !== locTrangThai) return false;
    if (locBeMat !== 'tat_ca' && b.beMat !== locBeMat) return false;
    return true;
  });

  const demSanSang = danhSach.filter((b) => b.trangThai === 'san_sang').length;
  const demBanNhap = danhSach.filter((b) => b.trangThai === 'ban_nhap').length;
  const demDaDang = danhSach.filter((b) => b.trangThai === 'da_dang').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Bo loc & Tong quan */}
      <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            className={`btn btn--sm ${locTrangThai === 'tat_ca' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setLocTrangThai('tat_ca')}
          >
            Tất cả ({danhSach.length})
          </button>
          <button
            type="button"
            className={`btn btn--sm ${locTrangThai === 'san_sang' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setLocTrangThai('san_sang')}
          >
            <Icon name="i-check" size={14} /> Sẵn sàng đăng ({demSanSang})
          </button>
          <button
            type="button"
            className={`btn btn--sm ${locTrangThai === 'ban_nhap' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setLocTrangThai('ban_nhap')}
          >
            <Icon name="i-file" size={14} /> Bản nháp ({demBanNhap})
          </button>
          <button
            type="button"
            className={`btn btn--sm ${locTrangThai === 'da_dang' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setLocTrangThai('da_dang')}
          >
            <Icon name="i-layers" size={14} /> Đã đăng ({demDaDang})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Bề mặt:</span>
          <select
            className="select"
            style={{ padding: '6px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-strong)', background: 'var(--surface)', fontSize: 13 }}
            value={locBeMat}
            onChange={(e) => setLocBeMat(e.target.value)}
          >
            <option value="tat_ca">Tất cả bề mặt</option>
            <option value="fanpage">Fanpage Facebook</option>
            <option value="ho_so_ca_nhan">Trang cá nhân</option>
            <option value="tiktok">TikTok Video</option>
            <option value="zalo">Zalo</option>
          </select>
        </div>
      </div>

      {/* 2. Danh sach the bai viet da tao */}
      {danhSachLoc.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {danhSachLoc.map((item) => {
            const laKichBan = item.dangBai === 'kich_ban_quay';
            let formattedText = item.noiDung;

            try {
              if (laKichBan && item.noiDung.startsWith('[')) {
                const phanCanh = JSON.parse(item.noiDung);
                formattedText = Array.isArray(phanCanh)
                  ? phanCanh.map((p: { thoiLuongGiay?: number; hinhAnh?: string; loiThoai?: string }, i: number) =>
                      `[Cảnh ${i + 1} - ${p.thoiLuongGiay ?? 5}s] ${p.hinhAnh ?? ''}\n👉 Lời thoại: "${p.loiThoai ?? ''}"`
                    ).join('\n\n')
                  : item.noiDung;
              }
            } catch {
              // giu nguyen text
            }

            return (
              <div
                key={item.id}
                className="cot-be-mat"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  border: item.trangThai === 'san_sang' ? '1px solid var(--sage)' : '1px solid var(--line)',
                  background: 'var(--surface)',
                }}
              >
                <div>
                  {/* Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <span className="chip-note chip-note--brand" style={{ fontSize: 11, padding: '2px 8px' }}>
                        {item.beMat === 'fanpage' ? 'Fanpage' : item.beMat === 'ho_so_ca_nhan' ? 'Trang cá nhân' : item.beMat === 'tiktok' ? 'TikTok' : 'Zalo'}
                      </span>
                      <span
                        className={`chip-note ${item.trangThai === 'san_sang' ? 'chip-note--sage' : item.trangThai === 'da_dang' ? '' : 'chip-note--clay'}`}
                        style={{ fontSize: 11, padding: '2px 8px' }}
                      >
                        {item.trangThai === 'san_sang' ? '🟢 Sẵn sàng đăng' : item.trangThai === 'da_dang' ? '✅ Đã đăng' : '📝 Bản nháp'}
                      </span>
                      {laKichBan && (
                        <span className="chip-note" style={{ fontSize: 11, padding: '2px 8px' }}>
                          🎬 Kịch bản video
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn--sm"
                      style={{ padding: '2px 6px', color: 'var(--clay)', border: 'none', background: 'transparent' }}
                      title="Xóa bài"
                      disabled={isPending}
                      onClick={() => handleXoa(item.id)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Hook / Goc tiep can */}
                  {item.cauMoDau && (
                    <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 8, padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }}>
                      &ldquo;{item.cauMoDau}&rdquo;
                    </div>
                  )}

                  {/* Content Box */}
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: '#ffffff',
                      background: '#1e1915',
                      padding: 12,
                      borderRadius: 'var(--r-sm)',
                      border: '1px solid var(--line-strong)',
                      whiteSpace: 'pre-wrap',
                      maxHeight: 180,
                      overflowY: 'auto',
                    }}
                  >
                    {formattedText}
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 8 }}>
                    Tạo lúc: {new Date(item.ngayTao).toLocaleString('vi-VN')} · {item.moHinhDaSinh ?? 'AI Gemini'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => handleCopy(item.id, formattedText)}
                    style={{ flex: 1 }}
                  >
                    <Icon name={daCopyId === item.id ? 'i-check' : 'i-copy'} size={14} />
                    {daCopyId === item.id ? 'Đã sao chép!' : 'Sao chép'}
                  </button>

                  {item.trangThai !== 'da_dang' && (
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      title="Đánh dấu đã đăng lên kênh"
                      disabled={isPending}
                      onClick={() => handleDoiTrangThai(item.id, 'da_dang')}
                    >
                      <Icon name="i-check" size={14} /> Đã đăng
                    </button>
                  )}

                  <Link
                    className="btn btn--primary btn--sm"
                    href={`/studio/bien-soan?title=${encodeURIComponent(item.cauMoDau || 'Bài viết')}&angle=${encodeURIComponent(item.gocTiepCan || '')}&beMat=${item.beMat}`}
                    title="Mở trong trình biên soạn"
                  >
                    <Icon name="i-text" size={14} /> Sửa
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-2)' }}>
          <div style={{ marginBottom: 12 }}>
            <Icon name="i-folder" size={36} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px' }}>
            Chưa có bài viết nào trong danh mục này
          </h3>
          <p style={{ fontSize: 14, maxWidth: 480, margin: '0 auto 16px' }}>
            Khi bạn biên soạn bài viết hoặc bấm &ldquo;Duyệt &amp; Lưu sẵn sàng đăng&rdquo; ở trang Sinh hàng loạt, các bài viết sẽ được lưu tập trung tại đây để bạn copy đi đăng.
          </p>
          <Link className="btn btn--primary btn--sm" href="/studio/hang-loat">
            <Icon name="i-copy" size={14} /> Đến trang Sinh hàng loạt
          </Link>
        </div>
      )}
    </div>
  );
}
