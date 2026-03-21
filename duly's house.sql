CREATE TABLE `nguoi_dung` (
  `id` uuid PRIMARY KEY,
  `email` varchar(255) COMMENT 'Dùng để đăng nhập hệ thống'
);

CREATE TABLE `nhan_vien` (
  `id` uuid PRIMARY KEY,
  `auth_id` uuid COMMENT 'Liên kết với bảng users',
  `ho_ten` varchar(255),
  `sdt` varchar(255),
  `email` varchar(255),
  `vai_tro` varchar(255) COMMENT 'Quản lý, Lễ tân...',
  `trang_thai` boolean,
  `ngay_tao` timestamp
);

CREATE TABLE `khach_hang` (
  `id` uuid PRIMARY KEY,
  `auth_id` uuid COMMENT 'Null nếu là khách vãng lai (offline)',
  `ho_ten` varchar(255),
  `sdt` varchar(255),
  `email` varchar(255),
  `dia_chi` text,
  `ghi_chu` text,
  `cccd_mat_truoc` varchar(255),
  `cccd_mat_sau` varchar(255),
  `ngay_tao` timestamp
);

CREATE TABLE `co_so` (
  `id` uuid PRIMARY KEY,
  `ten_co_so` varchar(255),
  `dia_chi` varchar(255),
  `hotline` varchar(255),
  `mo_ta` text,
  `trang_thai` boolean
);

CREATE TABLE `loai_phong` (
  `id` uuid PRIMARY KEY,
  `id_co_so` uuid,
  `ten_loai` varchar(255) COMMENT 'VD: Standard, VIP, Family',
  `mo_ta` text,
  `gia_gio` numeric COMMENT 'Hỗ trợ khách thuê theo giờ',
  `gia_dem` numeric COMMENT 'Hỗ trợ khách thuê qua đêm',
  `trang_thai` boolean COMMENT 'True: Đang bán, False: Ngừng bán'
);

CREATE TABLE `phong` (
  `id` uuid PRIMARY KEY,
  `id_loai_phong` uuid,
  `ma_phong` varchar(255) COMMENT 'VD: P101, P102',
  `trang_thai` varchar(255) COMMENT 'Trống, Đang ở, Bảo trì...',
  `tinh_trang_vesinh` varchar(255) COMMENT 'Sạch, Đang dọn...',
  `ghi_chu` text,
  `anh_chinh` varchar(255)
);

CREATE TABLE `dat_phong` (
  `id` uuid PRIMARY KEY,
  `ma_dat` varchar(255) COMMENT 'Mã tra cứu ngắn (VD: BK1234)',
  `id_khach_hang` uuid,
  `id_nhan_vien` uuid COMMENT 'Lưu ID người duyệt đơn/Check-in',
  `thoi_gian_nhan` timestamp,
  `thoi_gian_tra` timestamp,
  `so_khach` int,
  `trang_thai` varchar(255) COMMENT 'Chờ duyệt, Đã cọc, Hoàn thành, Đã hủy',
  `tong_tien` numeric,
  `coc_csvc` numeric COMMENT 'Tiền cọc cơ sở vật chất (nếu có)',
  `ghi_chu` text,
  `ngay_tao` timestamp
);

CREATE TABLE `chi_tiet_dat_phong` (
  `id` uuid PRIMARY KEY,
  `id_dat_phong` uuid,
  `id_loai_phong` uuid COMMENT 'Loại phòng khách chọn trên Web',
  `id_phong` uuid COMMENT 'Null ban đầu, Lễ tân gán số phòng khi Check-in',
  `don_gia_ghi_nhan` numeric COMMENT 'Lưu chết giá tại thời điểm click đặt'
);

CREATE TABLE `thanh_toan` (
  `id` uuid PRIMARY KEY,
  `id_dat_phong` uuid,
  `phuong_thuc` varchar(255) COMMENT 'Tiền mặt, Chuyển khoản, Thẻ...',
  `so_tien` numeric,
  `ngay_tt` timestamp,
  `trang_thai` varchar(255) COMMENT 'Thành công, Thất bại...'
);

ALTER TABLE `nguoi_dung` ADD FOREIGN KEY (`id`) REFERENCES `nhan_vien` (`auth_id`);

ALTER TABLE `nguoi_dung` ADD FOREIGN KEY (`id`) REFERENCES `khach_hang` (`auth_id`);

ALTER TABLE `loai_phong` ADD FOREIGN KEY (`id_co_so`) REFERENCES `co_so` (`id`);

ALTER TABLE `phong` ADD FOREIGN KEY (`id_loai_phong`) REFERENCES `loai_phong` (`id`);

ALTER TABLE `dat_phong` ADD FOREIGN KEY (`id_khach_hang`) REFERENCES `khach_hang` (`id`);

ALTER TABLE `dat_phong` ADD FOREIGN KEY (`id_nhan_vien`) REFERENCES `nhan_vien` (`id`);

ALTER TABLE `chi_tiet_dat_phong` ADD FOREIGN KEY (`id_dat_phong`) REFERENCES `dat_phong` (`id`);

ALTER TABLE `chi_tiet_dat_phong` ADD FOREIGN KEY (`id_loai_phong`) REFERENCES `loai_phong` (`id`);

ALTER TABLE `chi_tiet_dat_phong` ADD FOREIGN KEY (`id_phong`) REFERENCES `phong` (`id`);

ALTER TABLE `thanh_toan` ADD FOREIGN KEY (`id_dat_phong`) REFERENCES `dat_phong` (`id`);
