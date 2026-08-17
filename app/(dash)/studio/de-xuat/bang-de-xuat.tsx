'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Icon } from '../../../sprite-icon';
import type { BeMat, YTuongDeXuat } from '@/lib/studio/kieu';
import { luuYTuongAction, sinhDeXuatAction, xoaYTuongAction } from './actions';

type Props = {
  doDayDuBanDau: {
    phanTram: number;
    duocPhep: boolean;
    lyDo: string | null;
  };
  danhSachTruCot: { ten: string; tiLeMucTieu: number | null }[];
  yTuongDaLuuBanDau?: YTuongDeXuat[];
};

export function BangDeXuat({ doDayDuBanDau, danhSachTruCot, yTuongDaLuuBanDau = [] }: Props) {
  const [tabHienThi, setTabHienThi] = useState<'moi_sinh' | 'kho_da_luu'>('moi_sinh');
  const [beMat, setBeMat] = useState<BeMat>('fanpage');
  const [soLuong, setSoLuong] = useState<number>(10);
  const [danhSachMoi, setDanhSachMoi] = useState<YTuongDeXuat[]>([]);
  const [khoDaLuu, setKhoDaLuu] = useState<YTuongDeXuat[]>(yTuongDaLuuBanDau);
  const [locBeMatKho, setLocBeMatKho] = useState<string>('tat_ca');

  const [dangLuu, setDangLuu] = useState<Set<number>>(new Set());
  const [daLuu, setDaLuu] = useState<Set<number>>(new Set());
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const beMatOptions: { key: BeMat; label: string; icon: string }[] = [
    { key: 'fanpage', label: 'Fanpage Facebook', icon: 'i-layers' },
    { key: 'ho_so_ca_nhan', label: 'Trang cá nhân', icon: 'i-person' },
    { key: 'tiktok', label: 'TikTok Video', icon: 'i-film' },
    { key: 'zalo', label: 'Zalo cá nhân', icon: 'i-text' },
  ];

  function handleSinhDeXuat() {
    setThongBaoLoi(null);
    setThongBaoThanhCong(null);
    startTransition(async () => {
      try {
        const res = await sinhDeXuatAction(beMat, soLuong);
        if (res.thanhCong && res.duLieu) {
          setDanhSachMoi(res.duLieu);
          setTabHienThi('moi_sinh');
          // Cap nhat kho luu voi cac y tuong moi tu dong duoc luu
          setKhoDaLuu((prev) => [...(res.duLieu || []), ...prev]);
          setThongBaoThanhCong(`Đã sinh và tự động lưu ${res.duLieu.length} ý tưởng mới vào kho!`);
        } else {
          setThongBaoLoi(res.loi ?? 'Không thể đề xuất ý tưởng.');
        }
      } catch (err) {
        setThongBaoLoi((err as Error).message || 'Có lỗi xảy ra khi gọi đề xuất.');
      }
    });
  }

  async function handleLuu(item: YTuongDeXuat, index: number) {
    if (daLuu.has(index) || dangLuu.has(index)) return;

    setDangLuu((prev) => new Set(prev).add(index));
    try {
      const res = await luuYTuongAction(item);
      if (res.thanhCong) {
        setDaLuu((prev) => new Set(prev).add(index));
        setKhoDaLuu((prev) => [{ ...item, ideaId: res.id }, ...prev]);
      }
    } catch {
      // ignore
    } finally {
      setDangLuu((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  }

  async function handleXoaKho(ideaId: string) {
    try {
      await xoaYTuongAction(ideaId);
      setKhoDaLuu((prev) => prev.filter((k) => k.ideaId !== ideaId));
    } catch {
      // ignore
    }
  }

  const danhSachHienThi = tabHienThi === 'moi_sinh' ? danhSachMoi : khoDaLuu.filter((k) => {
    if (locBeMatKho === 'tat_ca') return true;
    return k.beMat === locBeMatKho;
  });

  return (
    <div className="de-xuat-container">
      {/* 1. Canh bao do day du neu chua dat 60% */}
      {!doDayDuBanDau.duocPhep && (
        <div className="panel panel--warning" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Icon name="i-alert" size={20} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--clay)' }}>
                Hồ sơ thương hiệu đạt {doDayDuBanDau.phanTram}% (Cần tối thiểu 60%)
              </div>
              <p style={{ margin: '4px 0 10px', fontSize: 14 }}>
                {doDayDuBanDau.lyDo}
              </p>
              <Link className="btn btn--secondary btn--sm" href="/brand">
                <Icon name="i-layers" size={14} /> Hoàn thiện hồ sơ kênh ngay
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Thanh dieu khien tham so sinh y tuong */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>BỀ MẶT ĐĂNG</div>
            <div className="chon-be-mat">
              {beMatOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`btn btn--sm ${beMat === opt.key ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() => setBeMat(opt.key)}
                >
                  <Icon name={opt.icon} size={15} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>SỐ LƯỢNG Ý TƯỞNG</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`btn btn--sm ${soLuong === num ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() => setSoLuong(num)}
                >
                  {num} ý tưởng
                </button>
              ))}
            </div>
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button
              type="button"
              className="btn btn--primary"
              disabled={isPending || !doDayDuBanDau.duocPhep}
              onClick={handleSinhDeXuat}
              style={{ minWidth: 170 }}
            >
              <Icon name="i-sparkle" size={16} />
              {isPending ? 'Đang phân tích & sinh...' : 'Đề xuất hôm nay'}
            </button>
          </div>
        </div>

        {danhSachTruCot.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)', fontSize: 13, color: 'var(--ink-2)' }}>
            <strong>Tỷ lệ trụ cột mục tiêu:</strong>{' '}
            {danhSachTruCot.map((t, idx) => (
              <span key={t.ten} style={{ marginRight: 12 }}>
                {t.ten} {t.tiLeMucTieu ? `(${t.tiLeMucTieu}%)` : ''}{idx < danhSachTruCot.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {thongBaoLoi && (
        <div className="panel" style={{ marginBottom: 20, borderColor: 'var(--clay)', color: 'var(--clay)', fontSize: 14 }}>
          <Icon name="i-alert" size={16} /> {thongBaoLoi}
        </div>
      )}

      {thongBaoThanhCong && (
        <div className="panel" style={{ marginBottom: 20, borderColor: 'var(--sage)', color: 'var(--sage)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="i-check" size={16} /> {thongBaoThanhCong}
        </div>
      )}

      {/* 3. Thanh chuyen doi Tab giua "Gợi ý mới nhất" & "Kho ý tưởng đã lưu" */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn btn--sm ${tabHienThi === 'moi_sinh' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setTabHienThi('moi_sinh')}
          >
            <Icon name="i-sparkle" size={15} /> Gợi ý mới ({danhSachMoi.length})
          </button>
          <button
            type="button"
            className={`btn btn--sm ${tabHienThi === 'kho_da_luu' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setTabHienThi('kho_da_luu')}
          >
            <Icon name="i-folder" size={15} /> Kho ý tưởng trong CSDL ({khoDaLuu.length})
          </button>
        </div>

        {tabHienThi === 'kho_da_luu' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Lọc bề mặt:</span>
            <select
              className="select"
              style={{ padding: '4px 8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 13 }}
              value={locBeMatKho}
              onChange={(e) => setLocBeMatKho(e.target.value)}
            >
              <option value="tat_ca">Tất cả bề mặt</option>
              <option value="fanpage">Fanpage</option>
              <option value="ho_so_ca_nhan">Trang cá nhân</option>
              <option value="tiktok">TikTok</option>
              <option value="zalo">Zalo</option>
            </select>
          </div>
        )}
      </div>

      {/* 4. Danh sach the y tuong */}
      {danhSachHienThi.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {danhSachHienThi.map((item, idx) => {
            const daLuuRoi = Boolean(item.ideaId) || daLuu.has(idx);
            const dangLuuNay = dangLuu.has(idx);

            const searchParams = new URLSearchParams({
              title: item.tieuDe,
              beMat: item.beMat,
              ...(item.ideaId ? { ideaId: item.ideaId } : {}),
              ...(item.truCot ? { pillar: item.truCot } : {}),
              ...(item.chanDung ? { persona: item.chanDung } : {}),
              ...(item.gocTiepCan ? { angle: item.gocTiepCan } : {}),
              ...(item.cauMoDau ? { hook: item.cauMoDau } : {}),
            });

            return (
              <div
                key={item.ideaId || idx}
                className="cot-be-mat"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  {/* Badge tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <span className="chip-note chip-note--brand" style={{ fontSize: 11, padding: '2px 8px' }}>
                        {item.beMat === 'fanpage' ? 'Fanpage' : item.beMat === 'ho_so_ca_nhan' ? 'Trang cá nhân' : item.beMat === 'tiktok' ? 'TikTok' : 'Zalo'}
                      </span>
                      {item.truCot && (
                        <span className="chip-note" style={{ fontSize: 11, padding: '2px 8px' }}>
                          <Icon name="i-pillars" size={11} /> {item.truCot}
                        </span>
                      )}
                      {item.chanDung && (
                        <span className="chip-note" style={{ fontSize: 11, padding: '2px 8px' }}>
                          <Icon name="i-person" size={11} /> {item.chanDung}
                        </span>
                      )}
                      {item.khamPha && (
                        <span className="chip-note chip-note--sage" style={{ fontSize: 11, padding: '2px 8px' }}>
                          <Icon name="i-sparkle" size={11} /> Dò đường / Mới
                        </span>
                      )}
                    </div>

                    {item.ideaId && tabHienThi === 'kho_da_luu' && (
                      <button
                        type="button"
                        className="btn btn--sm"
                        style={{ padding: '2px 6px', color: 'var(--clay)', border: 'none', background: 'transparent' }}
                        title="Xóa khỏi kho"
                        onClick={() => handleXoaKho(item.ideaId!)}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4, margin: '0 0 8px', color: 'var(--ink)' }}>
                    {item.tieuDe}
                  </h3>

                  {/* Angle & Hook */}
                  {item.gocTiepCan && (
                    <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 0 6px' }}>
                      <strong>Góc tiếp cận:</strong> {item.gocTiepCan}
                    </p>
                  )}

                  {item.cauMoDau && (
                    <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink)', margin: '0 0 8px', padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }}>
                      &ldquo;{item.cauMoDau}&rdquo;
                    </p>
                  )}

                  {item.lyDoDeXuat && (
                    <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: 0 }}>
                      💡 {item.lyDoDeXuat}
                    </p>
                  )}

                  {/* Reference signal link */}
                  {item.lienKetNguon && (
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--sage)' }}>
                      <a href={item.lienKetNguon} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="i-link" size={12} /> Nguồn tham khảo: {item.tenKenhNguon ?? 'Kênh ngoài'}
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--line)', marginTop: 4 }}>
                  <button
                    type="button"
                    className={`btn btn--sm ${daLuuRoi ? 'btn--ghost' : 'btn--secondary'}`}
                    disabled={daLuuRoi || dangLuuNay}
                    onClick={() => handleLuu(item, idx)}
                    style={{
                      flex: 1,
                      ...(daLuuRoi ? { color: 'var(--sage)', borderColor: 'var(--sage)', background: 'var(--surface-2)' } : {}),
                    }}
                  >
                    <Icon name={daLuuRoi ? 'i-check' : 'i-file'} size={14} />
                    {daLuuRoi ? 'Đã lưu CSDL' : dangLuuNay ? 'Đang lưu...' : 'Lưu ý'}
                  </button>

                  <Link
                    className="btn btn--primary btn--sm"
                    href={`/studio/bien-soan?${searchParams.toString()}`}
                    style={{ flex: 1 }}
                  >
                    <Icon name="i-text" size={14} /> Biên soạn
                  </Link>

                  <Link
                    className="btn btn--secondary btn--sm"
                    href={`/studio/kich-ban?${searchParams.toString()}`}
                    title="Viết kịch bản quay video ngắn"
                  >
                    <Icon name="i-film" size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-2)' }}>
          <div style={{ marginBottom: 12 }}>
            <Icon name="i-sparkle" size={36} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px' }}>
            {tabHienThi === 'kho_da_luu' ? 'Chưa có ý tưởng nào trong kho' : 'Chưa có đề xuất mới nào'}
          </h3>
          <p style={{ fontSize: 14, maxWidth: 500, margin: '0 auto 16px' }}>
            {tabHienThi === 'kho_da_luu'
              ? 'Khi bạn bấm "Đề xuất hôm nay", các ý tưởng sẽ được tự động lưu vào kho CSDL để bạn tra cứu và biên soạn bất cứ lúc nào.'
              : 'Bấm nút "Đề xuất hôm nay" ở trên để AI Content tự động tổng hợp 4 nguồn dữ liệu và gợi ý danh sách ý tưởng bài đăng mới nhất.'}
          </p>
        </div>
      )}
    </div>
  );
}
