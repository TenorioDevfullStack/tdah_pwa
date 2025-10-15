"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export default function AppFooter({ enableDevTools }) {
  const { messages } = useI18n();
  const copy = messages.layout;
  return (
    <footer>
      {copy.footer} <br />
      · <Link href="/feedback">{copy.feedback}</Link>
      {enableDevTools && (
        <>
          {" "}
          · <Link href="/qr">{copy.qr}</Link>
        </>
      )}
    </footer>
  );
}
