'use strict';

require('tsx/cjs');
require('dotenv').config();

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  TI_LE_KHAM_PHA,
  donKetQuaDeXuat,
  raiTheoTruCot,
} = require('../lib/studio/de-xuat.ts');

const {
  demTu,
  kiemTraDoDai,
} = require('../lib/studio/cong-dem-tu.ts');

const {
  donKetQuaKichBan,
} = require('../lib/studio/kich-ban.ts');

describe('donKetQuaDeXuat (Hop dong va lam sach y tuong)', () => {
  const truCotHopLe = ['Kien thuc', 'San pham', 'Giai tri'];
  const chanDungHopLe = ['Chu shop thoi trang', 'Nhan vien van phong'];

  it('TI_LE_KHAM_PHA co gia tri dung 0.2', () => {
    assert.equal(TI_LE_KHAM_PHA, 0.2);
  });

  it('don ket qua tho hop le va giu dung tru cot, chan dung co that', () => {
    const tho = {
      yTuong: [
        {
          tieuDe: 'Bi quyet tang don gap doi',
          truCot: 'Kien thuc',
          chanDung: 'Chu shop thoi trang',
          gocTiepCan: 'Truoc va sau',
          cauMoDau: 'Ban co biet 80% chu shop mac loi nay?',
          lyDoDeXuat: 'Danh dung noi dau ve chi phi',
          beMat: 'fanpage',
          kham_pha: false,
        },
      ],
    };

    const ketQua = donKetQuaDeXuat(tho, truCotHopLe, chanDungHopLe, 'fanpage');
    assert.equal(ketQua.length, 1);
    assert.equal(ketQua[0].tieuDe, 'Bi quyet tang don gap doi');
    assert.equal(ketQua[0].truCot, 'Kien thuc');
    assert.equal(ketQua[0].chanDung, 'Chu shop thoi trang');
    assert.equal(ketQua[0].khamPha, false);
    assert.equal(ketQua[0].beMat, 'fanpage');
  });

  it('tru cot va chan dung bia ra (khong co trong ho so) BI DAT NULL', () => {
    const tho = {
      yTuong: [
        {
          tieuDe: 'Y tuong ngoai le',
          truCot: 'Tru cot tu bia',
          chanDung: 'Doi tuong khong ton tai',
          gocTiepCan: 'Goc tu do',
          cauMoDau: 'Cau mo dau',
          lyDoDeXuat: 'Ly do',
          beMat: 'fanpage',
          kham_pha: true,
        },
      ],
    };

    const ketQua = donKetQuaDeXuat(tho, truCotHopLe, chanDungHopLe, 'fanpage');
    assert.equal(ketQua.length, 1);
    assert.equal(ketQua[0].truCot, null, 'tru cot khong co trong ho so phai bi ve null');
    assert.equal(ketQua[0].chanDung, null, 'chan dung khong co trong ho so phai bi ve null');
    assert.equal(ketQua[0].khamPha, true);
  });

  it('khop tru cot va chan dung khong phan biet chu hoa/thuong nhung tra ve dung ten goc', () => {
    const tho = {
      yTuong: [
        {
          tieuDe: 'Y tuong khac chu hoa thuong',
          truCot: 'kien thuc',
          chanDung: 'CHU SHOP THOI TRANG',
          beMat: 'tiktok',
        },
      ],
    };

    const ketQua = donKetQuaDeXuat(tho, truCotHopLe, chanDungHopLe, 'tiktok');
    assert.equal(ketQua.length, 1);
    assert.equal(ketQua[0].truCot, 'Kien thuc');
    assert.equal(ketQua[0].chanDung, 'Chu shop thoi trang');
  });

  it('gan tinHieuGocId neu co map tham khao', () => {
    const tinHieuMap = new Map([
      ['sig-1', { id: 'sig-1', tenKenh: 'Kenh Tham Khao A', lienKet: 'https://fb.com/1' }],
    ]);

    const tho = {
      yTuong: [
        {
          tieuDe: 'Hoc cach ke tu xu huong',
          truCot: 'Kien thuc',
          chanDung: 'Chu shop thoi trang',
          lyDoDeXuat: 'Hoc theo cong thuc cua Kenh Tham Khao A',
          beMat: 'fanpage',
        },
      ],
    };

    const ketQua = donKetQuaDeXuat(tho, truCotHopLe, chanDungHopLe, 'fanpage', TI_LE_KHAM_PHA, tinHieuMap);
    assert.equal(ketQua.length, 1);
    assert.equal(ketQua[0].trendSignalId, 'sig-1');
    assert.equal(ketQua[0].tenKenhNguon, 'Kenh Tham Khao A');
    assert.equal(ketQua[0].lienKetNguon, 'https://fb.com/1');
  });

  it('du lieu tho hong hoac rong khong lam no tien trinh', () => {
    assert.deepEqual(donKetQuaDeXuat(null), []);
    assert.deepEqual(donKetQuaDeXuat({}), []);
    assert.deepEqual(donKetQuaDeXuat('van ban rac'), []);
    assert.deepEqual(donKetQuaDeXuat({ yTuong: [{ tieuDe: '' }] }), []);
  });
});

describe('raiTheoTruCot (Can bang ty le tru cot muc tieu)', () => {
  const yTuongMau = [
    { tieuDe: 'Y1', truCot: 'A', chanDung: null, gocTiepCan: null, cauMoDau: null, lyDoDeXuat: null, beMat: 'fanpage', khamPha: false },
    { tieuDe: 'Y2', truCot: 'A', chanDung: null, gocTiepCan: null, cauMoDau: null, lyDoDeXuat: null, beMat: 'fanpage', khamPha: false },
    { tieuDe: 'Y3', truCot: 'A', chanDung: null, gocTiepCan: null, cauMoDau: null, lyDoDeXuat: null, beMat: 'fanpage', khamPha: false },
    { tieuDe: 'Y4', truCot: 'B', chanDung: null, gocTiepCan: null, cauMoDau: null, lyDoDeXuat: null, beMat: 'fanpage', khamPha: false },
    { tieuDe: 'Y5', truCot: 'B', chanDung: null, gocTiepCan: null, cauMoDau: null, lyDoDeXuat: null, beMat: 'fanpage', khamPha: false },
    { tieuDe: 'Y6', truCot: 'C', chanDung: null, gocTiepCan: null, cauMoDau: null, lyDoDeXuat: null, beMat: 'fanpage', khamPha: false },
    { tieuDe: 'Y7', truCot: null, chanDung: null, gocTiepCan: null, cauMoDau: null, lyDoDeXuat: null, beMat: 'fanpage', khamPha: true },
  ];

  it('rai theo ti le phan tram 50/30/20', () => {
    const truCotMucTieu = [
      { ten: 'A', tiLeMucTieu: 50 },
      { ten: 'B', tiLeMucTieu: 30 },
      { ten: 'C', tiLeMucTieu: 20 },
    ];

    const ketQua = raiTheoTruCot(yTuongMau, truCotMucTieu, 5);
    assert.equal(ketQua.length, 5);
    const demA = ketQua.filter((k) => k.truCot === 'A').length;
    const demB = ketQua.filter((k) => k.truCot === 'B').length;
    assert.ok(demA >= 2);
    assert.ok(demB >= 1);
  });

  it('bu dap tu tru cot khac neu mot tru cot thieu ung vien', () => {
    const truCotMucTieu = [
      { ten: 'A', tiLeMucTieu: 10 },
      { ten: 'C', tiLeMucTieu: 90 }, // C chi co 1 y tuong trong tap tho
    ];

    const ketQua = raiTheoTruCot(yTuongMau, truCotMucTieu, 4);
    assert.equal(ketQua.length, 4, 'van phai du 4 y tuong bang cach bu tu tru cot A va B');
  });

  it('so luong yeu cau = 0 hoac tap tho rong tra ve mang rong', () => {
    assert.deepEqual(raiTheoTruCot([], [], 5), []);
    assert.deepEqual(raiTheoTruCot(yTuongMau, [], 0), []);
  });
});

describe('cong-dem-tu (Dem tu va tran do dai tung be mat)', () => {
  it('demTu dem dung so tieng cach nhau boi khoang trang', () => {
    assert.equal(demTu(''), 0);
    assert.equal(demTu('   '), 0);
    assert.equal(demTu('Hom nay la mot ngay tuyet voi'), 7);
    assert.equal(demTu('  Nhieu   khoang   trang   '), 3);
  });

  it('kiemTraDoDai phan biet ngan, dat, dai theo tran be mat', () => {
    // Fanpage: 150 - 300 tu
    const vanBanNgan = 'mot '.repeat(100);
    const kqNgan = kiemTraDoDai(vanBanNgan, 'fanpage');
    assert.equal(kqNgan.trangThai, 'ngan');
    assert.equal(kqNgan.lech, 50);

    const vanBanChuan = 'mot '.repeat(200);
    const kqChuan = kiemTraDoDai(vanBanChuan, 'fanpage');
    assert.equal(kqChuan.trangThai, 'dat');
    assert.equal(kqChuan.lech, 0);

    const vanBanDai = 'mot '.repeat(350);
    const kqDai = kiemTraDoDai(vanBanDai, 'fanpage');
    assert.equal(kqDai.trangThai, 'dai');
    assert.equal(kqDai.lech, 50);

    // TikTok: 60 - 120 tu
    const vanBanTikTok = 'tu '.repeat(80);
    const kqTikTok = kiemTraDoDai(vanBanTikTok, 'tiktok');
    assert.equal(kqTikTok.trangThai, 'dat');

    // Zalo: 40 - 100 tu
    const vanBanZalo = 'tin '.repeat(50);
    const kqZalo = kiemTraDoDai(vanBanZalo, 'zalo');
    assert.equal(kqZalo.trangThai, 'dat');
  });
});

describe('donKetQuaKichBan (Xu ly phan canh video)', () => {
  it('don ket qua phan canh hop le va tinh tong thoi luong', () => {
    const tho = {
      tieuDe: 'Kich ban video TikTok mau',
      phanCanh: [
        { thoiLuongGiay: 3, hinhAnh: 'Goc quay can mat', loiThoai: 'Dung bo qua video nay' },
        { thoiLuongGiay: 15, hinhAnh: 'Demo san pham', loiThoai: 'Day la cach lam' },
        { thoiLuongGiay: 5, hinhAnh: 'Goc quay tong the', loiThoai: 'Nhan vao link ben duoi' },
      ],
    };

    const kb = donKetQuaKichBan(tho, 'Mac dinh');
    assert.equal(kb.tieuDe, 'Kich ban video TikTok mau');
    assert.equal(kb.phanCanh.length, 3);
    assert.equal(kb.tongThoiLuongGiay, 23);
    assert.equal(kb.phanCanh[0].thoiLuongGiay, 3);
  });

  it('dau vao sai dinh dang tra ve tieu de mac dinh va mang rong', () => {
    const kb = donKetQuaKichBan(null, 'Tieu de mac dinh');
    assert.equal(kb.tieuDe, 'Tieu de mac dinh');
    assert.equal(kb.phanCanh.length, 0);
    assert.equal(kb.tongThoiLuongGiay, 0);
  });
});
