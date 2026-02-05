"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/ModalContext";
import jsPDF from "jspdf";
import { api } from "@/lib/api";
import SlipTemplate from "@/components/payroll/slip/SlipTemplate";
import SlipActions from "@/components/payroll/slip/SlipActions";
import PaySalaryModal from "@/components/payroll/slip/PaySalaryModal";
import { toPng } from "html-to-image"; // Added this import

export default function SlipView({ slipId }) {
  const router = useRouter();
  const { alert } = useModal();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [slip, setSlip] = useState(null);
  const [company, setCompany] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const slipRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch slip
      const data = await api.payroll.getSlip(slipId);
      if (data.slip) {
        setSlip(data.slip);
      }

      // Fetch company details (for header)
      const compData = await api.setup.getProfile();
      if (compData.profile) {
        setCompany(compData.profile || compData.data || null);
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

  const handleDownload = async () => {
    if (!slipRef.current) return;
    setDownloading(true);

    // Hide buttons for capture and ensure print styles
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
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = dataUrl;

      const imgProps = pdf.getImageProperties(dataUrl);
      const imgWidth = imgProps.width;
      const imgHeight = imgProps.height;

      const ratio = pdfWidth / imgWidth;
      const finalHeight = imgHeight * ratio;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, finalHeight);
      pdf.save(`Payslip_${slip.userId.name}_${slip.month}_${slip.year}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      await alert({
        title: "Error",
        message: "Failed to generate PDF. You can try printing instead.",
        variant: "danger",
      });
    } finally {
      if (buttons) buttons.style.display = "flex";
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Handle email sending
  const handleSendEmailAction = async () => {
    setSendingEmail(true);
    try {
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
        // Refresh data to show sent status if we added UI for it
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          onClick={() => router.back()}
          className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-8 print:p-0 print:bg-white">
      <SlipActions
        onBack={() => router.push("/payroll")}
        onPrint={handlePrint}
        onDownload={handleDownload}
        loading={downloading || sendingEmail}
        onPay={() => setIsPayModalOpen(true)}
        status={slip.status}
        onSendEmail={handleSendEmailAction}
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
