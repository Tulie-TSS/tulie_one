import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tulie Studio × ISME Career Fair 2026",
  description:
    "Ưu đãi độc quyền tại Ngày hội Hướng nghiệp ISME - NEU: Ảnh thẻ chuẩn Hàn Quốc & Website CV chuyên nghiệp. Chỉ hôm nay 10/04!",
};

export default function ISMELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
