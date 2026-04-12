"use client";

import { useState, useEffect, useCallback, useMemo, FormEvent } from "react";
import { Zap, Clock, Check, Gift, X, Plus, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { submitEventSaleOrder } from "./actions";
import styles from "./isme.module.css";
import { EventSale, EventSaleService, EventSaleComboRule } from "@repo/db-types";


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

/* ─── Group label mapping ─── */
const GROUP_LABELS: Record<string, string> = {
  photo_id: "Ảnh thẻ",
  photo_profile: "Ảnh Profile",
  website: "Website",
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
  photo_id: "Ảnh thẻ chuẩn Hàn Quốc, sửa trang phục chuyên nghiệp",
  photo_profile: "Bộ ảnh profile đa góc, tạo ấn tượng chuyên nghiệp",
  website: "Website cá nhân nổi bật, thể hiện năng lực chuyên môn",
};

/* ─── Service Card (Multi-select) ─── */
function ServiceCard({
  svc,
  selected,
  isLate,
  onToggle,
}: {
  svc: EventSaleService;
  selected: boolean;
  isLate: boolean;
  onToggle: (id: string) => void;
}) {
  const activeSalePrice = isLate && svc.latePrice !== undefined ? svc.latePrice : svc.salePrice;
  const showStrike = svc.originalPrice > activeSalePrice;

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ""} ${svc.isCombo ? styles.cardCombo : ""}`}
      onClick={() => onToggle(svc.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle(svc.id)}
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

      {/* Add-on info note (not interactive — addon is decided during editing) */}
      {svc.addonLabel && (
        <div className={styles.addonNote}>
          <Plus size={12} />
          {svc.addonLabel}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function EventSaleClient({ eventData }: { eventData: EventSale }) {
  const countdown = useCountdown(eventData.deadline_time);
  const isLate = eventData.deadline_time ? new Date() > new Date(eventData.deadline_time) : false;

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [refCode, setRefCode] = useState("");
  const [note, setNote] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = eventData.services || [];
  const comboRules = eventData.combo_rules || [];
  const referralRules = eventData.referral_rules;

  // Group services by their group field
  const groupedServices = useMemo(() => {
    const groups: Record<string, EventSaleService[]> = {};
    const ungrouped: EventSaleService[] = [];
    for (const svc of services) {
      if (svc.group) {
        if (!groups[svc.group]) groups[svc.group] = [];
        groups[svc.group].push(svc);
      } else {
        ungrouped.push(svc);
      }
    }
    return { groups, ungrouped };
  }, [services]);

  // Group order for display
  const groupOrder = ["photo_id", "photo_profile", "website"];

  // Handle selection toggle with maxSelect enforcement
  const handleToggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        const svc = services.find((s) => s.id === id);
        if (next.has(id)) {
          next.delete(id);
        } else {
          // Enforce maxSelect within group
          if (svc?.maxSelect && svc.group) {
            const groupSvcs = services.filter((s) => s.group === svc.group);
            const selectedInGroup = groupSvcs.filter((s) => next.has(s.id));
            if (selectedInGroup.length >= svc.maxSelect) {
              // Remove oldest selection in group
              for (const s of selectedInGroup) {
                next.delete(s.id);
              }
            }
          }
          next.add(id);
        }
        return next;
      });
    },
    [services]
  );



  // ─── Pricing calculation ───
  const pricing = useMemo(() => {
    const selectedSvcs = services.filter((s) => selectedIds.has(s.id));
    if (selectedSvcs.length === 0) return null;

    // Line items
    const items = selectedSvcs.map((svc) => {
      const salePrice = isLate && svc.latePrice !== undefined ? svc.latePrice : svc.salePrice;
      return {
        svc,
        salePrice,
        lineTotal: salePrice,
        originalTotal: svc.originalPrice,
      };
    });

    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const originalTotal = items.reduce((s, i) => s + i.originalTotal, 0);

    // Check combo eligibility
    let comboDiscount = 0;
    let activeCombo: EventSaleComboRule | null = null;

    for (const rule of comboRules) {
      const allGroupsSatisfied = rule.requireGroups.every((g) =>
        selectedSvcs.some((s) => s.group === g)
      );
      if (allGroupsSatisfied) {
        const discount = Math.round(subtotal * (rule.discountPercent / 100));
        if (discount > comboDiscount) {
          comboDiscount = discount;
          activeCombo = rule;
        }
      }
    }

    const total = subtotal - comboDiscount;
    const totalSaving = originalTotal - total;

    return { items, subtotal, comboDiscount, activeCombo, total, totalSaving, originalTotal };
  }, [services, selectedIds, isLate, comboRules]);

  /* Sticky bar visibility */
  useEffect(() => {
    if (!pricing) return;
    const onScroll = () => {
      const el = document.getElementById("summarySection");
      if (!el) return;
      const r = el.getBoundingClientRect();
      setShowSticky(r.bottom < 0 || r.top > window.innerHeight);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pricing]);

  const handleSubmitOrder = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!pricing || pricing.items.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 dịch vụ!");
      return;
    }
    if (!fullname.trim() || !phone.trim()) {
      toast.error("Vui lòng nhập Họ tên và Số điện thoại!");
      return;
    }

    setIsSubmitting(true);

    const orderItems = pricing.items.map((item) => ({
      serviceId: item.svc.id,
      serviceName: item.svc.name,
      originalPrice: item.svc.originalPrice,
      salePrice: item.salePrice,
      lineTotal: item.lineTotal,
    }));

    const formData = new FormData();
    formData.set("fullname", fullname);
    formData.set("phone", phone);
    formData.set("email", email);
    formData.set("refCode", refCode);
    formData.set("note", note);
    formData.set("eventName", eventData.name);
    formData.set("eventCode", eventData.code);
    formData.set("orderItems", JSON.stringify(orderItems));
    formData.set("subtotal", pricing.subtotal.toString());
    formData.set("comboDiscount", pricing.comboDiscount.toString());
    formData.set("comboLabel", pricing.activeCombo?.label || "");
    formData.set("total", pricing.total.toString());
    formData.set("originalTotal", pricing.originalTotal.toString());
    formData.set("totalSaving", pricing.totalSaving.toString());
    if (eventData.bank_account) {
      formData.set("bankInfo", JSON.stringify(eventData.bank_account));
    }

    const res = await submitEventSaleOrder(formData);

    if (res.success && res.token) {
      toast.success("Đã ghi nhận đơn hàng! Đang chuyển hướng...");
      setIsSubmitting(false);
      window.location.href = `/portal/order/${res.token}`;
    } else {
      setIsSubmitting(false);
      toast.error("Lỗi tạo thông tin: " + res.error);
    }
  };

  // Check if any group has selections (for combo indicator)
  const selectedGroups = useMemo(() => {
    const groups = new Set<string>();
    services.forEach((s) => {
      if (selectedIds.has(s.id) && s.group) groups.add(s.group);
    });
    return groups;
  }, [services, selectedIds]);

  const hasPhoto = selectedGroups.has("photo_id") || selectedGroups.has("photo_profile");
  const hasWebsite = selectedGroups.has("website");
  const isComboActive = pricing?.activeCombo != null;

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
                <div className={styles.brandEvent}>{eventData.brand_name}</div>
              </>
            ) : (
              <>
                <div className={styles.brandSep} />
                <div className={styles.brandEvent}>
                  {eventData.name.split(" ").slice(0, 2).join(" ")}
                  <br />
                  {eventData.name.split(" ").slice(2).join(" ")}
                </div>
              </>
            )}
          </div>
          <div className={styles.heroBadge}>
            <span className={styles.dot} /> Đang nhận đơn
          </div>
          <h1>
            {eventData.hero_title || (
              <>
                Chuẩn bị hồ sơ xin việc
                <br />
                chuyên nghiệp cùng Tulie
              </>
            )}
          </h1>
          <p>
            {eventData.hero_subtitle ||
              "Ảnh thẻ chuẩn Hàn Quốc & Website CV cá nhân — ưu đãi độc quyền tại sự kiện hôm nay."}
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
                    <div className={styles.lbl}>{["Giờ", "Phút", "Giây"][i]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Combo hint banner */}
        {comboRules.length > 0 && (
          <div className={`${styles.comboBanner} ${isComboActive ? styles.comboBannerActive : ""}`}>
            <Sparkles size={16} />
            <div>
              {isComboActive ? (
                <strong>🎉 Combo đã kích hoạt! Giảm thêm {pricing?.activeCombo?.discountPercent}%</strong>
              ) : (
                <>
                  <strong>Combo tiết kiệm:</strong> Chọn cả Ảnh + Website để được giảm thêm{" "}
                  {comboRules[0]?.discountPercent}%
                </>
              )}
            </div>
          </div>
        )}

        {/* Section 1: Services grouped */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionNum}>1</div>
            <div>
              <div className={styles.sectionTitle}>Chọn gói Dịch vụ</div>
              <div className={styles.sectionSub}>
                {isLate
                  ? "Rất tiếc thời hạn ưu đãi sớm đã kết thúc, nhưng bạn vẫn có thể đặt dịch vụ ngay."
                  : "Chọn một hoặc nhiều gói phù hợp với nhu cầu của bạn"}
              </div>
            </div>
          </div>

          {/* Render by group */}
          {groupOrder
            .filter((g) => groupedServices.groups[g]?.length > 0)
            .map((groupKey) => (
              <div key={groupKey} className={styles.serviceGroup}>
                <div className={styles.groupHeader}>
                  <div className={styles.groupTitle}>{GROUP_LABELS[groupKey] || groupKey}</div>
                  <div className={styles.groupDesc}>{GROUP_DESCRIPTIONS[groupKey] || ""}</div>
                  {selectedGroups.has(groupKey) && (
                    <span className={styles.groupCheck}>
                      <Check size={12} /> Đã chọn
                    </span>
                  )}
                </div>
                <div className={styles.groupCards}>
                  {groupedServices.groups[groupKey].map((svc) => (
                    <ServiceCard
                      key={svc.id}
                      svc={svc}
                      selected={selectedIds.has(svc.id)}
                      isLate={isLate}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </div>
            ))}

          {/* Ungrouped services if any */}
          {groupedServices.ungrouped.length > 0 && (
            <div className={styles.groupCards}>
              {groupedServices.ungrouped.map((svc) => (
                <ServiceCard
                  key={svc.id}
                  svc={svc}
                  selected={selectedIds.has(svc.id)}
                  isLate={isLate}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Customer Info */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionNum}>2</div>
            <div>
              <div className={styles.sectionTitle}>Thông tin khách hàng</div>
              <div className={styles.sectionSub}>Nhập thông tin để thiết lập lịch hẹn / đơn hàng</div>
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
              <label>
                Email <span className={styles.req}>*</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Mã đơn hàng giới thiệu (nếu có)</label>
              <input
                type="text"
                placeholder="VD: TS-00123"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value)}
              />
              <div className={styles.fieldHint}>
                Nhập mã đơn hàng của người đã giới thiệu bạn (nếu có)
              </div>
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
        {pricing && (
          <section className={styles.section} id="summarySection">
            <div className={styles.sectionHead}>
              <div className={styles.sectionNum}>3</div>
              <div>
                <div className={styles.sectionTitle}>Xác nhận & Thanh toán</div>
              </div>
            </div>
            <div className={styles.summary}>
              {pricing.items.map((item, idx) => (
                <div key={idx}>
                  <div className={styles.summaryRow}>
                    <span className={styles.label}>{item.svc.name}</span>
                    <span className={styles.val}>{fmt(item.salePrice)}</span>
                  </div>
                </div>
              ))}

              {pricing.comboDiscount > 0 && (
                <div className={styles.summaryRow}>
                  <span className={`${styles.label} ${styles.comboLabel}`}>
                    <Sparkles size={12} />
                    {pricing.activeCombo?.label || "Ưu đãi Combo Ảnh + Website"}
                  </span>
                  <span className={`${styles.val} ${styles.discount}`}>
                    -{fmt(pricing.comboDiscount)}
                  </span>
                </div>
              )}

              {pricing.totalSaving > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.label}>Tiết kiệm so với giá gốc</span>
                  <span className={`${styles.val} ${styles.discount}`}>
                    -{fmt(pricing.totalSaving)}
                  </span>
                </div>
              )}

              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span className={styles.totalLabel}>Tổng thanh toán</span>
                <span className={styles.totalVal}>{fmt(pricing.total)}</span>
              </div>
            </div>
            <button
              className={styles.ctaPrimary}
              onClick={() => handleSubmitOrder()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Thanh toán giữ chỗ ngay"}
            </button>
          </section>
        )}

        {/* Referral Info Section */}
        {referralRules && (
          <section className={styles.section}>
            <div className={styles.referral}>
              <h3>
                <Gift size={16} /> Giới thiệu bạn bè — Nhận hoàn tiền {referralRules.cashbackPercent}%
              </h3>
              <p className={styles.referralSub}>
                {referralRules.description ||
                  `Hoàn ${referralRules.cashbackPercent}% giá trị đơn hàng cho người giới thiệu khi đơn hàng mới hoàn thành thành công.`}
              </p>
              <div className={styles.refGrid}>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>
                    <strong>Bước 1.</strong> Hoàn thành đơn hàng của bạn
                  </span>
                </div>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>
                    <strong>Bước 2.</strong> Nhận mã đơn hàng (VD: TS-00123)
                  </span>
                </div>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>
                    <strong>Bước 3.</strong> Chia sẻ mã cho bạn bè khi họ đặt đơn mới
                  </span>
                </div>
                <div className={styles.refItem}>
                  <span className={styles.refLabel}>
                    <strong>Bước 4.</strong> Nhận hoàn tiền {referralRules.cashbackPercent}% khi đơn bạn bè hoàn thành
                  </span>
                  <span className={styles.refValue}>
                    <Users size={14} /> Hoàn {referralRules.cashbackPercent}%
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bar */}
      {pricing && (
        <div className={`${styles.stickyBar} ${showSticky ? styles.stickyShow : ""}`}>
          <div className={styles.stickyInner}>
            <div className={styles.stickyPrice}>
              <span>
                {pricing.items.length} dịch vụ{isComboActive ? " · Combo" : ""}
              </span>
              <span className={styles.stickyAmount}>{fmt(pricing.total)}</span>
            </div>
            <button
              className={styles.stickyBtn}
              onClick={() =>
                document.getElementById("summarySection")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Thanh toán
            </button>
          </div>
        </div>
      )}

    {/* No Payment Modal - Handled by redirect to Portal */}

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
            Hotline: <a href={`tel:${eventData.hotline || ''}`}>{eventData.hotline || ''}</a> ·{" "}
            <a href={`https://zalo.me/${eventData.hotline || ''}`} target="_blank" rel="noreferrer">
              Zalo
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
