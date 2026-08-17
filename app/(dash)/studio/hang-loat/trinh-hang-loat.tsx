'use client';

import { useState, useTransition } from 'react';
import { Icon } from '../../../sprite-icon';
import type { BeMat } from '@/lib/studio/kieu';
import type { ItemHangLoat } from '@/lib/studio/hang-loat';
import { luuLoAction, sinhHangLoatAction } from './actions';

type Props = {
  doDayDuBanDau: {
    phanTram: number;
    duocPhep: boolean;
    lyDo: string | null;
  };
};

export function TrinhHangLoat({ doDayDuBanDau }: Props) {
  const [soLuong, setSoLuong] = useState<number>(10);
  const [beMat, setBeMat] = useState<BeMat>('fanpage');
  const [danhSach, setDanhSach] = useState<ItemHangLoat[]>([]);
  const [dangXemId, setDangXemId] = useState<string | null>(null);
  const [thongBaoLuu, setThongBaoLuu] = useState<string | null>(null);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);
  const [tienDo, setTienDo] = useState<number>(0);
  const [isPendingSinh, startTransitionSinh] = useTransition();
  const [isPendingLuu, startTransitionLuu] = useTransition();

  function handleSinhHangLoat() {
    setThongBaoLoi(null);
    setThongBaoLuu(null);
    setTienDo(15);

    startTransitionSinh(async () => {
      const interval = setInterval(() => {
        setTienDo((prev) => {
          if (prev >= 85) return prev;
          return prev + 12;
        });
      }, 600);

      try {
        const res = await sinhHangLoatAction(soLuong, beMat);
        clearInterval(interval);
        setTienDo(100);

        if (res.thanhCong && res.duLieu) {
          setDanhSach(res.duLieu.danhSach);
        } else {
          setThongBaoLoi(res.loi ?? 'Không thể sinh lô bài viết.');
        }
      } catch (err) {
        clearInterval(interval);
        setThongBaoLoi((err as Error).message || 'Lỗi khi sinh hàng loạt.');
      }
    });
  }

  function toggleChon(id: string) {
    setDanhSach((prev) =>
      prev.map((item) => (item.id === id ? { ...item, duocChon: !item.duocChon } : item)),
    );
  }

  function toggleChonTatCa() {
    const tatCaDangChon = danhSach.every((d) => d.duocChon);
    setDanhSach((prev) => prev.map((item) => ({ ...item, duocChon: !tatCaDangChon })));
  }

  function handleLuuLo(trangThai: 'ban_nhap' | 'san_sang') {
    const chon = danhSach.filter((d) => d.duocChon);
    if (chon.length === 0) {
      setThongBaoLoi('Vui lòng chọn ít nhất 1 bài viết để lưu.');
      return;
    }
    setThongBaoLoi(null);

    startTransitionLuu(async () => {
      try {
        const res = await luuLoAction(chon, trangThai);
        setThongBaoLuu(`Đã lưu thành công ${res.soLuongLuu} bài viết vào kho bài ${trangThai === 'san_sang' ? 'Sẵn sàng đăng' : 'Bản nháp'}!`);
      } catch (err) {
        setThongBaoLoi((err as Error).message || 'Lỗi khi lưu lô bài viết.');
      }
    });
  }

  const soLuongChon = danhSach.filter((d) => d.duocChon).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. Panel cau hinh & nut bam sinh hang loat */}
      <div className="panel">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="i-copy" size={18} /> Kế hoạch sản xuất 10 bài Facebook / ngày
            </h2>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
              Tự động phân bổ theo 10 khung giờ vàng (Feed, Story, Reels) và cân bằng theo trụ cột nội dung.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select
              className="select"
              style={{ padding: '8px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              value={soLuong}
              onChange={(e) => setSoLuong(Number(e.target.value))}
            >
              <option value={5}>5 bài / ngày (Cơ bản)</option>
              <option value={10}>10 bài / ngày (Mục tiêu chuẩn)</option>
              <option value={15}>15 bài / ngày (Đẩy mạnh tương tác)</option>
            </select>

            <select
              className="select"
              style={{ padding: '8px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              value={beMat}
              onChange={(e) => setBeMat(e.target.value as BeMat)}
            >
              <option value="fanpage">Kênh Fanpage Facebook</option>
              <option value="ho_so_ca_nhan">Trang cá nhân</option>
            </select>

            <button
              type="button"
              className="btn btn--primary"
              disabled={isPendingSinh || !doDayDuBanDau.duocPhep}
              onClick={handleSinhHangLoat}
              style={{ minWidth: 160 }}
            >
              <Icon name="i-sparkle" size={16} />
              {isPendingSinh ? 'Đang sản xuất lô...' : `Sinh ${soLuong} bài ngay`}
            </button>
          </div>
        </div>

        {/* Thanh tien do */}
        {isPendingSinh && (
          <div className="tien-do" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-2)' }}>
              <span>Đang phân tích dữ liệu, rải trụ cột &amp; viết nội dung...</span>
              <span>{tienDo}%</span>
            </div>
            <div className="tien-do__thanh">
              <div className="tien-do__chay" style={{ width: `${tienDo}%` }} />
            </div>
          </div>
        )}
      </div>

      {thongBaoLoi && (
        <div className="panel" style={{ borderColor: 'var(--clay)', color: 'var(--clay)', fontSize: 14 }}>
          <Icon name="i-alert" size={16} /> {thongBaoLoi}
        </div>
      )}

      {thongBaoLuu && (
        <div className="panel" style={{ borderColor: 'var(--sage)', color: 'var(--sage)', fontSize: 14, fontWeight: 600 }}>
          <Icon name="i-check" size={16} /> {thongBaoLuu}
        </div>
      )}

      {/* 2. Danh sach lo bai viet sinh ra */}
      {danhSach.length > 0 && (
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" className="btn btn--secondary btn--sm" onClick={toggleChonTatCa}>
                <Icon name="i-check" size={14} /> {danhSach.every((d) => d.duocChon) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                Đã chọn <strong>{soLuongChon}</strong>/{danhSach.length} bài
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={isPendingLuu || soLuongChon === 0}
                onClick={() => handleLuuLo('ban_nhap')}
              >
                <Icon name="i-file" size={14} /> Lưu nháp ({soLuongChon})
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                disabled={isPendingLuu || soLuongChon === 0}
                onClick={() => handleLuuLo('san_sang')}
              >
                <Icon name="i-check" size={14} /> Duyệt &amp; Lưu sẵn sàng đăng ({soLuongChon})
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {danhSach.map((item, idx) => {
              const laDangXem = dangXemId === item.id;
              const contentText = item.dangBai === 'kich_ban_quay' && item.kichBan
                ? item.kichBan.phanCanh.map((p, i) => `[Cảnh ${i + 1} - ${p.thoiLuongGiay}s] ${p.hinhAnh} -> "${p.loiThoai}"`).join('\n')
                : (item.baiViet?.noiDung ?? item.yTuong.tieuDe);

              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)',
                    background: item.duocChon ? 'var(--surface)' : 'var(--surface-2)',
                    padding: 14,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <input
                        type="checkbox"
                        checked={item.duocChon}
                        onChange={() => toggleChon(item.id)}
                        style={{ marginTop: 4, cursor: 'pointer' }}
                      />

                      <div>
                        {/* Tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                          <span className="chip-note" style={{ fontSize: 11, padding: '2px 8px', fontWeight: 600 }}>
                            ⏰ Bài #{idx + 1} · {item.khungGio.khungGio}
                          </span>
                          <span className={`chip-note ${item.dangBai === 'kich_ban_quay' ? 'chip-note--clay' : 'chip-note--brand'}`} style={{ fontSize: 11, padding: '2px 8px' }}>
                            {item.khungGio.dinhDang === 'Reels' ? '🎬 Kịch bản Reels' : item.khungGio.dinhDang === 'Story' ? '📱 Story ngắn' : '📝 Bài Feed dài'}
                          </span>
                          {item.yTuong.truCot && (
                            <span className="chip-note" style={{ fontSize: 11, padding: '2px 8px' }}>
                              {item.yTuong.truCot}
                            </span>
                          )}
                          {item.yTuong.khamPha && (
                            <span className="chip-note chip-note--sage" style={{ fontSize: 11, padding: '2px 8px' }}>
                              ✨ Khám phá
                            </span>
                          )}
                        </div>

                        {/* Title & Goal */}
                        <h4 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', color: 'var(--ink)' }}>
                          {item.yTuong.tieuDe}
                        </h4>
                        <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 8 }}>
                          🎯 Mục tiêu: {item.khungGio.mucTieu}
                        </div>

                        {/* Preview / Full Content */}
                        <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)', whiteSpace: 'pre-wrap', maxHeight: laDangXem ? 'none' : '65px', overflow: 'hidden' }}>
                          {contentText}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => setDangXemId(laDangXem ? null : item.id)}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <Icon name={laDangXem ? 'i-chevron' : 'i-eye'} size={14} />
                      {laDangXem ? 'Thu gọn' : 'Xem chi tiết'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
