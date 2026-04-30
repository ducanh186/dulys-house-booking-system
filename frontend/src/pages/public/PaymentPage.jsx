import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Upload, CheckCircle2, AlertCircle, Copy, QrCode, Landmark, ChevronLeft, ImageIcon, X } from 'lucide-react';
import { getBooking, uploadPaymentProof, markPaymentSubmitted, getBankInfo } from '../../api/bookings';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import PriceDisplay from '../../components/common/PriceDisplay';
import StatusBadge from '../../components/common/StatusBadge';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const fileInputRef = useRef(null);

  const [booking, setBooking] = useState(state?.booking || null);
  const [bankInfo, setBankInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const pollRef = useRef(null);

  const homestayName = state?.homestayName || '';
  const roomTypeName = state?.roomTypeName || '';

  useEffect(() => {
    if (!booking) {
      navigate('/my-profile/bookings', { replace: true });
    }
  }, [booking, navigate]);

  useEffect(() => {
    getBankInfo().then(res => setBankInfo(res.data)).catch(() => {});
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!booking?.expires_at) return;
    const update = () => {
      const diff = new Date(booking.expires_at) - Date.now();
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [booking?.expires_at]);

  // Poll booking status every 8 seconds
  const pollBooking = useCallback(async () => {
    if (!booking?.id) return;
    try {
      const res = await getBooking(booking.id);
      const updated = res.data;
      setBooking(updated);

      if (updated.status === 'confirmed') {
        navigate('/booking/success', {
          state: {
            booking: updated,
            homestayName,
            roomTypeName,
            paymentMethod: 'transfer',
            successVariant: 'payment_confirmed',
          },
          replace: true,
        });
      }
    } catch {
      // ignore polling errors
    }
  }, [booking?.id, navigate, homestayName, roomTypeName]);

  useEffect(() => {
    pollRef.current = setInterval(pollBooking, 8000);
    return () => clearInterval(pollRef.current);
  }, [pollBooking]);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh không được vượt quá 5MB.');
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setError('');
  }

  function clearProof() {
    setProofFile(null);
    setProofPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUploadProof() {
    if (!proofFile || !booking?.id) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('proof_image', proofFile);
      const res = await uploadPaymentProof(booking.id, formData);
      setBooking(res.data);
      clearProof();
    } catch (err) {
      setError(err?.message || 'Không thể tải lên minh chứng. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  }

  async function handleMarkSubmitted() {
    if (!booking?.id) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await markPaymentSubmitted(booking.id);
      setBooking(res.data);
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  }

  if (!booking) return null;

  const payment = booking.payments?.[0];
  const isExpired = booking.status === 'expired' || booking.status === 'cancelled' || timeLeft === 0;
  const isPendingPayment = booking.status === 'pending_payment';
  const isPaymentReview = booking.status === 'payment_review';

  const minutes = timeLeft !== null ? Math.floor(timeLeft / 60) : '--';
  const seconds = timeLeft !== null ? timeLeft % 60 : '--';

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface-container-low border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/my-profile/bookings')}
            className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-3"
          >
            <ChevronLeft className="h-4 w-4" />
            Lịch sử đặt phòng
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-2xl font-bold text-on-surface">Thanh toán chuyển khoản</h1>
              <p className="text-sm text-on-surface-variant mt-1">Đơn {booking.booking_code} — {homestayName}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Countdown */}
        {isPendingPayment && !isExpired && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-800">Thời gian thanh toán còn lại</p>
                    <p className="text-xs text-orange-600">Vui lòng hoàn tất chuyển khoản trước khi hết hạn</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-headline text-3xl font-bold text-orange-700 tabular-nums">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expired state */}
        {isExpired && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-6 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="font-semibold text-red-800 text-lg">Đơn đặt phòng đã hết hạn</p>
              <p className="text-sm text-red-600 mt-1">Thời gian thanh toán đã hết. Vui lòng đặt phòng mới.</p>
              <Button onClick={() => navigate('/search')} className="mt-4">Tìm phòng mới</Button>
            </CardContent>
          </Card>
        )}

        {/* Payment review state */}
        {isPaymentReview && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-800">Đang chờ xác nhận thanh toán</p>
                  <p className="text-sm text-purple-600">Chúng tôi đã nhận được thông tin thanh toán và đang xác minh. Bạn sẽ nhận thông báo khi hoàn tất.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isExpired && (
          <>
            {/* QR Code + Bank Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <QrCode className="h-5 w-5 text-primary" />
                    Mã QR chuyển khoản
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {payment?.qr_payload ? (
                    <img
                      src={payment.qr_payload}
                      alt="VietQR"
                      className="w-64 h-auto rounded-2xl border border-border"
                      loading="eager"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-64 h-64 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant text-sm">
                      Đang tạo mã QR...
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Landmark className="h-5 w-5 text-primary" />
                    Thông tin chuyển khoản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoCopy label="Ngân hàng" value={bankInfo?.bank_name || 'MB Bank'} onCopy={() => copyToClipboard(bankInfo?.bank_name || 'MB Bank', 'bank')} copied={copied === 'bank'} />
                  <InfoCopy label="Số tài khoản" value={bankInfo?.account_number || '0379163557'} onCopy={() => copyToClipboard(bankInfo?.account_number || '0379163557', 'account')} copied={copied === 'account'} />
                  <InfoCopy label="Chủ tài khoản" value={bankInfo?.account_holder || 'DULY S HOUSE'} onCopy={() => copyToClipboard(bankInfo?.account_holder || 'DULY S HOUSE', 'holder')} copied={copied === 'holder'} />
                  <InfoCopy
                    label="Số tiền"
                    value={formatCurrency(booking.total_amount)}
                    onCopy={() => copyToClipboard(String(Math.round(booking.total_amount)), 'amount')}
                    copied={copied === 'amount'}
                  />
                  <InfoCopy
                    label="Nội dung CK"
                    value={payment?.transfer_content || booking.booking_code}
                    onCopy={() => copyToClipboard(payment?.transfer_content || booking.booking_code, 'content')}
                    copied={copied === 'content'}
                    highlight
                  />
                </CardContent>
              </Card>
            </div>

            {/* Upload Proof Section */}
            {(isPendingPayment || isPaymentReview) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5 text-primary" />
                    Minh chứng chuyển khoản
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {payment?.proof_image_url && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Đã tải lên minh chứng</span>
                      </div>
                      <img
                        src={payment.proof_image_url}
                        alt="Minh chứng"
                        className="max-h-48 rounded-xl"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {proofPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={proofPreview}
                          alt="Preview"
                          className="max-h-48 rounded-xl mx-auto"
                          decoding="async"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); clearProof(); }}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-on-surface-variant mx-auto mb-2" />
                        <p className="text-sm text-on-surface-variant">Nhấn để chọn ảnh chụp màn hình chuyển khoản</p>
                        <p className="text-xs text-on-surface-variant mt-1">JPG, PNG — tối đa 5MB</p>
                      </>
                    )}
                  </div>

                  {proofFile && (
                    <Button onClick={handleUploadProof} disabled={uploading} className="w-full">
                      {uploading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Đang tải lên...
                        </span>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Gửi minh chứng thanh toán
                        </>
                      )}
                    </Button>
                  )}

                  {isPendingPayment && !proofFile && (
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-on-surface-variant mb-3">Đã chuyển khoản nhưng không có ảnh?</p>
                      <Button
                        variant="outline"
                        onClick={handleMarkSubmitted}
                        disabled={submitting}
                        className="w-full"
                      >
                        {submitting ? 'Đang xử lý...' : 'Tôi đã chuyển khoản'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InfoCopy({ label, value, onCopy, copied, highlight }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl px-3 py-2.5 ${highlight ? 'bg-primary/5 border border-primary/20' : 'bg-surface-container-low'}`}>
      <div>
        <p className="text-xs text-on-surface-variant">{label}</p>
        <p className={`font-semibold ${highlight ? 'text-primary' : 'text-on-surface'}`}>{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
      >
        {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Đã sao chép' : 'Sao chép'}
      </button>
    </div>
  );
}

function formatCurrency(amount) {
  if (!amount) return '0₫';
  return Number(amount).toLocaleString('vi-VN') + '₫';
}
