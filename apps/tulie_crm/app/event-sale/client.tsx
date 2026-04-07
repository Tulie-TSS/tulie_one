"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { Zap, Clock, Check, Gift, X } from "lucide-react";
import { toast } from "sonner";
import { submitEventSaleOrder } from "./actions";
import styles from "./isme.module.css";
import { EventSale, EventSaleService } from "@repo/db-types";

const BANK_ID = "MB";
const ACCOUNT_NO = "0339068379";
const ACCOUNT_NAME = "NGUYEN HOANG TUNG";

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

/* ─── Countdown Hook ─── */
function useCountdown(deadlineStr: string | null | undefined) {
  const [time, setTime] = useState<{ h: string; m: string; s: string } | null>(null);
  
  useEffect(() => {
    if (!deadlineStr) return;
    
    const target = new Date(deadlineStr);
    
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());
      
      if (diff === 0) {
        setTime({ h: "00", m: "00", s: "00" });
        return;
      }
      
      const hours = Math.floor(diff / 3600000);
      setTime({
        h: String(hours).padStart(2, "0"),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
      });
    };
    
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineStr]);
  
  return time;
}

/* ─── Service Card ─── */
function ServiceCard({
  svc,
  selected,
  isLate,
  onSelect,
}: {
  svc: EventSaleService;
  selected: boolean;
  isLate: boolean;
  onSelect: (k: string) => void;
}) {
  const activeSalePrice = isLate && svc.latePrice !== undefined ? svc.latePrice : svc.salePrice;
  const showStrike = svc.originalPrice > activeSalePrice;

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ""} ${svc.isCombo ? styles.cardCombo : ""}`}
      onClick={() => onSelect(svc.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(svc.id)}
    >
      <span className={styles.checkIcon}>
        <Check size={14} />
      </span>
      {svc.tagLabel && (
         <span className={`${styles.cardTag} ${svc.tagStyle ? styles[svc.tagStyle] : styles.tagHot}`}>
           {svc.tagLabel}
         </span>
      )}
      <h3 className={styles.cardTitle}>{svc.name}</h3>
      <p className={styles.cardDesc}>{svc.description}</p>
      <div className={styles.priceRow}>
        {showStrike && <span className={styles.priceOld}>{fmt(svc.originalPrice)}</span>}
        <span className={styles.priceNew}>
          {activeSalePrice.toLocaleString("vi-VN")}
          <sup>đ</sup>
        </span>
        {svc.savingText && !isLate && <span className={styles.priceSave}>{svc.savingText}</span>}
      </div>
      {svc.features && svc.features.length > 0 && (
         <ul className={styles.cardFeatures}>
           {svc.features.map((f: string, i: number) => (
             <li key={i}>
               <Check size={14} className={styles.liIcon} />
               {f}
             </li>
           ))}
         </ul>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function EventSaleClient({ eventData }: { eventData: EventSale }) {
  const countdown = useCountdown(eventData.deadline_time);
  const isLate = eventData.deadline_time ? new Date() > new Date(eventData.deadline_time) : false;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [refCode, setRefCode] = useState("");
  const [note, setNote] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderQrData, setOrderQrData] = useState<{ id: string; orderNumber: string; qrUrl: string } | null>(null);

  const services = eventData.services || [];
  const svc = services.find(s => s.id === selectedId) || null;
  const activeSalePrice = svc ? (isLate && svc.latePrice !== undefined ? svc.latePrice : svc.salePrice) : 0;
  const saving = svc ? svc.originalPrice - activeSalePrice : 0;

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  /* Sticky bar visibility */
  useEffect(() => {
    if (!selectedId) return;
    const onScroll = () => {
      const el = document.getElementById("summarySection");
      if (!el) return;
      const r = el.getBoundingClientRect();
      setShowSticky(r.bottom < 0 || r.top > window.innerHeight);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [selectedId]);

  const handleSubmitOrder = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedId || !svc) {
      toast.error("Vui lòng chọn dịch vụ!");
      return;
    }
    if (!fullname.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập Họ tên và Số điện thoại!");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("fullname", fullname);
    formData.set("phone", phone);
    formData.set("email", email);
    formData.set("refCode", refCode);
    formData.set("note", note);
    formData.set("serviceKey", selectedId);
    formData.set("price", activeSalePrice.toString());
    formData.set("originalPrice", svc.originalPrice.toString());
    formData.set("saving", saving.toString());
    formData.set("serviceName", svc.name);

    formData.set("eventName", eventData.name);
    formData.set("eventCode", eventData.code);

    const res = await submitEventSaleOrder(formData);
    setIsSubmitting(false);

    if (res.success && res.orderNumber) {
      toast.success("Đã ghi nhận đơn hàng!");
      const transferDesc = res.orderNumber;
      const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact.png?amount=${activeSalePrice}&addInfo=${encodeURIComponent(transferDesc)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
      setOrderQrData({ id: res.orderId, orderNumber: res.orderNumber, qrUrl });
      setShowModal(true);
    } else {
      toast.error("Lỗi tạo thông tin: " + res.error);
    }
  };

  return (
    <div className={styles.page}>
      {/* Urgency banner */}
      <div className={styles.urgency}>
        <Zap size={14} />
        <span>
          {eventData.banner_text || "Ưu đãi chỉ áp dụng tại sự kiện — Thanh toán giữ chỗ ngay hôm nay!"}
        </span>
      </div>

      <div className={styles.container}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.brand}>
            {eventData.logo_url ? (
                <img src={eventData.logo_url} alt="Logo" className="w-[120px] object-contain" />
            ) : (
                <div className={styles.brandLogo}>
                  <span>/.</span> tulie.agency
                </div>
            )}
            
            {eventData.brand_name ? (
                <>
                  <div className={styles.brandSep} />
                  <div className={styles.brandEvent}>
                    {eventData.brand_name}
                  </div>
                </>
            ) : (
                <>
                  <div className={styles.brandSep} />
                  <div className={styles.brandEvent}>
                    {eventData.name.split(' ').slice(0, 2).join(' ')}
                    <br />
                    {eventData.name.split(' ').slice(2).join(' ')}
                  </div>
                </>
            )}
          </div>
          <div className={styles.heroBadge}>
            <span className={styles.dot} /> Đang nhận đơn
          </div>
          <h1>
            {eventData.hero_title || (
                <>Chuẩn bị hồ sơ xin việc<br />chuyên nghiệp cùng Tulie</>
            )}
          </h1>
          <p>
            {eventData.hero_subtitle || "Ảnh thẻ chuẩn Hàn Quốc & Website CV cá nhân — ưu đãi độc quyền tại sự kiện hôm nay."}
          </p>

          {/* Countdown */}
          {countdown && (
            <div className={styles.countdownWrap}>
              <div className={styles.countdownLabel}>
                <Clock size={14} /> Ưu đãi kết thúc sau
              </div>
              <div className={styles.countdown}>
                {(["h", "m", "s"] as const).map((k, i) => (
                  <div className={styles.unit} key={k}>
                    <div className={styles.num}>{countdown[k]}</div>
                    <div className={styles.lbl}>
                      {["Giờ", "Phút", "Giây"][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 1: Services */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionNum}>1</div>
            <div>
              <div className={styles.sectionTitle}>Chọn gói Dịch vụ</div>
              <div className={styles.sectionSub}>
                {isLate ? "Rất tiếc thời hạn ưu đãi sớm đã kết thúc, nhưng bạn vẫn có thể đặt dịch vụ ngay." : "Chọn gói phù hợp với nhu cầu của bạn"}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
             {services.map((service) => (
                 <ServiceCard
                   key={service.id}
                   svc={service}
                   selected={selectedId === service.id}
                   isLate={isLate}
                   onSelect={handleSelect}
                 />
             ))}
          </div>
        </section>

        {/* Section 2: Customer Info */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionNum}>2</div>
            <div>
              <div className={styles.sectionTitle}>Thông tin khách hàng</div>
              <div className={styles.sectionSub}>
                Nhập thông tin để thiết lập lịch hẹn / đơn hàng
              </div>
            </div>
          </div>
          <div className={`${styles.card} ${styles.formCard}`}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>
                  Họ và tên <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  Số điện thoại <span className={styles.req}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Email <span className={styles.req}>*</span></label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Mã giới thiệu (nếu có)</label>
              <input
                type="text"
                placeholder="Nhập mã người giới thiệu"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Ghi chú / Thắc mắc</label>
              <textarea
                placeholder="Bạn muốn hỏi thêm thông tin gì không?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Summary */}
        {selectedId && svc && (
          <section className={styles.section} id="summarySection">
            <div className={styles.sectionHead}>
              <div className={styles.sectionNum}>3</div>
              <div>
                <div className={styles.sectionTitle}>Xác nhận & Thanh toán</div>
              </div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.label}>{svc.name}</span>
                <span className={`${styles.val} ${styles.strike}`}>
                  {fmt(svc.originalPrice)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.label}>Giảm giá Sự kiện</span>
                <span className={`${styles.val} ${saving > 0 ? styles.discount : ''}`}>
                  {saving > 0 ? `-${fmt(saving)}` : '0đ'}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span className={styles.totalLabel}>Tổng thanh toán</span>
                <span className={styles.totalVal}>{fmt(activeSalePrice)}</span>
              </div>
            </div>
            <button className={styles.ctaPrimary} onClick={() => handleSubmitOrder()} disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Thanh toán giữ chỗ ngay"}
            </button>
          </section>
        )}
      </div>

      {/* Sticky Bar */}
      {selectedId && svc && (
        <div
          className={`${styles.stickyBar} ${showSticky ? styles.stickyShow : ""}`}
        >
          <div className={styles.stickyInner}>
            <div className={styles.stickyPrice}>
              <span>Tổng thanh toán</span>
              <span className={styles.stickyAmount}>{fmt(activeSalePrice)}</span>
            </div>
            <button
              className={styles.stickyBtn}
              onClick={() =>
                document
                  .getElementById("summarySection")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Thanh toán
            </button>
          </div>
        </div>
      )}

      {/* QR Payment Modal */}
      {showModal && svc && orderQrData && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
             // Block click outside from closing to ensure they make payment
          }}
        >
          <div className={styles.modal}>
            <button
              className={styles.modalClose}
              onClick={() => {
                setShowModal(false);
                toast('Mã đơn hàng: ' + orderQrData.orderNumber);
              }}
            >
              <X size={16} />
            </button>
            <h2>Thanh toán giữ chỗ</h2>
            <div className={styles.modalAmount}>{fmt(activeSalePrice)}</div>
            <div className={styles.modalSub}>
              Mã đơn: <strong className="text-emerald-600">{orderQrData.orderNumber}</strong>
            </div>
            <div className={styles.qrBox}>
              <img src={orderQrData.qrUrl} alt="QR Payment" width={200} height={200} />
            </div>
            <div className={styles.bankInfo}>
              <strong>TULIE STUDIO</strong>
              <br />
              Ngân hàng: <strong>MB Bank</strong>
              <br />
              STK: <strong>0339 068 379</strong>
              <br />
              Chủ TK: <strong>NGUYEN HOANG TUNG</strong>
              <br />
              Nội dung C/K: <strong className="text-blue-600">{orderQrData.orderNumber}</strong>
            </div>
            <div className={styles.modalNote}>
              Sau khi thanh toán, hệ thống sẽ tự động xác nhận đơn hàng của bạn. Nếu cần hỗ trợ khẩn cấp, gọi <strong>0339 068 379</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={styles.container}>
        <footer className={styles.footer}>
          <p>
            © 2026{" "}
            <a href="https://tulie.studio" target="_blank" rel="noreferrer">
              Tulie Studio
            </a>{" "}
            — Ưu đãi sự kiện {eventData.name}
          </p>
          <p>
            Hotline: <a href="tel:0339068379">0339 068 379</a> ·{" "}
            <a
              href="https://zalo.me/0339068379"
              target="_blank"
              rel="noreferrer"
            >
              Zalo
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
