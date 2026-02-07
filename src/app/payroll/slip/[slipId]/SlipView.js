"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useModal } from "@/contexts/ModalContext";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";
import { api } from "@/lib/api";
import SlipTemplate from "@/components/payroll/slip/SlipTemplate";
import SlipActions from "@/components/payroll/slip/SlipActions";
import PaySalaryModal from "@/components/payroll/slip/PaySalaryModal";
import { toPng } from "html-to-image"; // Added this import

export default function SlipView({ slipId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { alert, confirm } = useModal();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [slip, setSlip] = useState(null);
  const [company, setCompany] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const slipRef = useRef(null);
  const emailTriggered = useRef(false); // Prevent duplicate email sends

  const fetchData = useCallback(async () => {
    try {
      // Fetch slip
      const data = await api.payroll.getSlip(slipId);
      if (data.slip) {
        setSlip(data.slip);
      }

      // Fetch company details (for header)
      const compData = await api.setup.getProfile();
      if (compData.data || compData.profile) {
        setCompany(compData.data || compData.profile || null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [slipId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle email sending with client-side PDF generation
  const handleSendEmailAction = useCallback(async () => {
    setSendingEmail(true);
    const startTime = Date.now();

    try {
      // Send email (PDF will be generated server-side)
      const res = await fetch("/api/payroll/email/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slipId }),
      });

      const data = await res.json();

      if (res.ok) {
        await alert({
          title: "Success",
          message: "Salary slip emailed successfully!",
          variant: "success",
        });
        // Refresh data to show sent status
        fetchData();
      } else {
        throw new Error(data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      await alert({
        title: "Error",
        message: error.message || "Failed to send email",
        variant: "danger",
      });
    } finally {
      setSendingEmail(false);
    }
  }, [slipId, alert, fetchData]);

  const handlePaySuccess = async () => {
    // Refresh data to show paid status
    fetchData();
    await alert({
      title: "Success",
      message: "Payment recorded successfully!",
      variant: "success",
    });
    router.refresh();
  };

  // Check if redirect from card with sendEmail parameter
  useEffect(() => {
    const shouldSendEmail = searchParams.get("sendEmail") === "true";
    if (
      shouldSendEmail &&
      session?.user?.role === "admin" &&
      !emailTriggered.current &&
      slip &&
      company &&
      !loading
    ) {
      emailTriggered.current = true; // Mark as triggered
      // Wait for component to fully render and ref to be available
      const timer = setTimeout(() => {
        if (slipRef.current) {
          handleSendEmailAction();
        }
      }, 1500); // Increased delay to ensure ref is ready

      return () => clearTimeout(timer);
    }
  }, [searchParams, session, slip, company, loading, handleSendEmailAction]);

  // Generate PDF as base64 string (reusable for download and email)
  const generatePdfBase64 = async () => {
    if (!slipRef.current) {
      throw new Error("Slip reference not available");
    }

    // Hide buttons for capture
    const buttons = document.getElementById("action-buttons");
    if (buttons) buttons.style.display = "none";

    try {
      const dataUrl = await toPng(slipRef.current, {
        quality: 0.95,
        backgroundColor: "#ffffff",
        pixelRatio: 2, // Higher quality
        style: {
          margin: "0",
          transform: "none",
        },
        width: 794, // Force A4 width in pixels at 96 DPI (210mm) ~794px.
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const imgProps = pdf.getImageProperties(dataUrl);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;

      const ratio = pdfWidth / imgWidth;
      const finalHeight = imgHeight * ratio;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, finalHeight);

      // Get PDF as ArrayBuffer and convert to base64
      const pdfArrayBuffer = pdf.output("arraybuffer");
      const pdfBytes = new Uint8Array(pdfArrayBuffer);

      // Convert to base64 using browser's btoa
      let binary = "";
      const len = pdfBytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(pdfBytes[i]);
      }
      const pdfBase64 = btoa(binary);

      return { pdf, pdfBase64 };
    } finally {
      if (buttons) buttons.style.display = "flex";
    }
  };

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const { pdf } = await generatePdfBase64();
      pdf.save(`Payslip_${slip.userId.name}_${slip.month}_${slip.year}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      await alert({
        title: "Error",
        message: "Failed to generate PDF. You can try printing instead.",
        variant: "danger",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!slip) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Slip not found
        </h2>
        <button
          onClick={() => router.push("/payroll")}
          className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-4 md:p-8 print:p-0 print:bg-white">
      <SlipActions
        onBack={() => router.push("/payroll")}
        onPrint={handlePrint}
        onDownload={handleDownload}
        downloadLoading={downloading}
        emailLoading={sendingEmail}
        onPay={
          session?.user?.role === "admin"
            ? () => setIsPayModalOpen(true)
            : undefined
        }
        status={slip.status}
        onSendEmail={
          session?.user?.role === "admin" ? handleSendEmailAction : undefined
        }
      />

        <SlipTemplate ref={slipRef} slip={slip} company={company} />

      <PaySalaryModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSuccess={handlePaySuccess}
        slip={slip}
      />
    </div>
  );
}
